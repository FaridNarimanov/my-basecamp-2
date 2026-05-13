const { Project, ProjectMember, Discussion, Thread, Message, User } = require('../models');
const { requireText } = require('../utils/validation');
const { getProjectAccess, isProjectAdmin } = require('../middleware/projectAccess');
const { destroyProjectWithRelatedData } = require('../utils/projectCleanup');

const countFor = async (Model, where) => Model.count({ where });

const projectSummary = async (project, relation, userRole) => {
    const owner = await User.findByPk(project.user_id, { attributes: ['email'] });
    const [memberCount, discussionCount, threadCount, messageCount] = await Promise.all([
        countFor(ProjectMember, { project_id: project.id }),
        countFor(Discussion, { project_id: project.id }),
        countFor(Thread, { project_id: project.id }),
        Message.count({
            include: [{
                model: Thread,
                as: 'thread',
                where: { project_id: project.id },
                attributes: []
            }]
        })
    ]);

    return {
        ...project.toJSON(),
        creator_email: owner ? owner.email : '',
        relation,
        user_role: userRole,
        member_count: memberCount + 1,
        discussion_count: discussionCount,
        thread_count: threadCount,
        message_count: messageCount
    };
};

const listProjects = async (req, res) => {
    try {
        const [ownedProjects, memberships] = await Promise.all([
            Project.findAll({ where: { user_id: req.session.userId }, order: [['id', 'DESC']] }),
            ProjectMember.findAll({
                where: { user_id: req.session.userId },
                include: [{ model: Project, as: 'project' }]
            })
        ]);

        const owned = await Promise.all(ownedProjects.map((project) => projectSummary(project, 'owner', 'owner')));
        const shared = await Promise.all(
            memberships
                .filter((membership) => membership.project)
                .map((membership) => projectSummary(membership.project, 'shared', membership.role))
        );

        res.json([...owned, ...shared]);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const createProject = async (req, res) => {
    const name = requireText(req.body.name, 'Project name');
    const description = requireText(req.body.description, 'Description');
    if (name.error || description.error) {
        return res.status(400).json({ message: 'Project name and description are required.' });
    }

    try {
        const project = await Project.create({
            name: name.value,
            description: description.value,
            user_id: req.session.userId
        });
        res.status(201).json({ message: 'Project created', id: project.id });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const updateProject = async (req, res) => {
    const name = requireText(req.body.name, 'Project name');
    const description = requireText(req.body.description, 'Description');
    if (name.error || description.error) {
        return res.status(400).json({ message: 'Project name and description are required.' });
    }

    try {
        const access = req.projectAccess || await getProjectAccess(req.params.id, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Project not found' });
        if (!isProjectAdmin(access, req.session.userId)) {
            return res.status(403).json({ message: 'Access denied. Only owner and admins can edit project details.' });
        }

        await access.project.update({ name: name.value, description: description.value });
        res.json({ message: 'Project updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            where: { id: req.params.id, user_id: req.session.userId }
        });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await destroyProjectWithRelatedData(req.params.id, req.session.userId);

        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const showProject = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const showProjectDetails = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id, {
            include: [{ model: User, as: 'owner', attributes: ['email', 'username'] }]
        });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const data = project.toJSON();
        data.creator_email = data.owner ? data.owner.email : '';
        data.creator_username = data.owner ? data.owner.username : '';
        delete data.owner;
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

module.exports = {
    listProjects,
    createProject,
    updateProject,
    deleteProject,
    showProject,
    showProjectDetails
};
