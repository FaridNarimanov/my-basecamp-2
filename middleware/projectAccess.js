const { Project, ProjectMember, Thread, Message } = require('../models');

const isProjectAdmin = (access, userId = null) => {
    if (!access) return false;
    const currentUserId = userId || access.current_user_id;
    return Number(access.owner_id) === Number(currentUserId) || access.role === 'admin';
};

const getProjectAccess = async (projectId, userId) => {
    const project = await Project.findByPk(projectId);
    if (!project) return null;

    const ownerId = Number(project.user_id);
    if (ownerId === Number(userId)) {
        return {
            project,
            id: project.id,
            owner_id: ownerId,
            role: null,
            current_user_id: Number(userId),
            user_role: 'owner',
            can_manage: true
        };
    }

    const membership = await ProjectMember.findOne({
        where: { project_id: projectId, user_id: userId }
    });
    if (!membership) return null;

    return {
        project,
        id: project.id,
        owner_id: ownerId,
        role: membership.role,
        current_user_id: Number(userId),
        user_role: membership.role,
        can_manage: membership.role === 'admin'
    };
};

const getProjectAccessWithCurrentUser = getProjectAccess;

const requireProjectAccess = async (req, res, next) => {
    try {
        const access = await getProjectAccess(req.params.id, req.session.userId);
        if (!access) return res.status(403).json({ message: 'Access denied.' });
        req.projectAccess = access;
        next();
    } catch (err) {
        next(err);
    }
};

const getThreadAccess = async (threadId, userId) => {
    const thread = await Thread.findByPk(threadId);
    if (!thread) return null;
    const access = await getProjectAccess(thread.project_id, userId);
    if (!access) return null;
    return { ...access, thread, ...thread.toJSON() };
};

const getMessageAccess = async (messageId, userId) => {
    const message = await Message.findByPk(messageId);
    if (!message) return null;
    const threadAccess = await getThreadAccess(message.thread_id, userId);
    if (!threadAccess) return null;
    return { ...threadAccess, message, ...message.toJSON(), project_id: threadAccess.thread.project_id };
};

module.exports = {
    requireProjectAccess,
    getProjectAccess,
    getProjectAccessWithCurrentUser,
    getThreadAccess,
    getMessageAccess,
    isProjectAdmin
};
