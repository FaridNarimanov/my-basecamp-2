const { ProjectMember, User } = require('../models');
const { requireText, normalizeProjectRole } = require('../utils/validation');
const { getProjectAccess, isProjectAdmin } = require('../middleware/projectAccess');

const addMember = async (req, res) => {
    const username = requireText(req.body.username, 'Username');
    const role = normalizeProjectRole(req.body.role);
    if (username.error) return res.status(400).json({ message: 'Username is required.' });
    if (!role) return res.status(400).json({ message: 'Invalid role. Allowed roles are admin and viewer.' });

    try {
        const user = await User.findOne({ where: { username: username.value } });
        if (!user) return res.status(404).json({ message: 'User not found in the system.' });

        const access = await getProjectAccess(req.params.id, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Project not found' });
        if (!isProjectAdmin(access, req.session.userId)) {
            return res.status(403).json({ message: 'Access denied. Only owner and admins can add members.' });
        }
        if (Number(access.owner_id) === Number(user.id)) {
            return res.status(400).json({ message: 'This user is already the project owner.' });
        }

        await ProjectMember.upsert({ project_id: req.params.id, user_id: user.id, role });
        res.json({ message: `Member (@${username.value}) successfully added as ${role}!` });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const listMembers = async (req, res) => {
    try {
        const access = await getProjectAccess(req.params.id, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Project not found' });

        const owner = await User.findByPk(access.owner_id, {
            attributes: ['name', 'username', 'profile_pic', 'email']
        });
        const memberships = await ProjectMember.findAll({
            where: { project_id: req.params.id },
            include: [{ model: User, as: 'user', attributes: ['name', 'username', 'profile_pic', 'email'] }]
        });

        const rows = [];
        if (owner) rows.push({ ...owner.toJSON(), role: 'Owner' });
        for (const membership of memberships) {
            if (Number(membership.user_id) !== Number(access.owner_id) && membership.user) {
                rows.push({ ...membership.user.toJSON(), role: membership.role });
            }
        }

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const removeMember = async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.params.username } });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const access = await getProjectAccess(req.params.id, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Project not found' });
        if (!isProjectAdmin(access, req.session.userId) && Number(req.session.userId) !== Number(user.id)) {
            return res.status(403).json({ message: 'Only project owner or admins can remove members.' });
        }
        if (Number(access.owner_id) === Number(user.id)) {
            return res.status(400).json({ message: 'Cannot remove the project owner.' });
        }

        await ProjectMember.destroy({ where: { project_id: req.params.id, user_id: user.id } });
        res.json({ message: 'Member removed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const updateMemberRole = async (req, res) => {
    const role = normalizeProjectRole(req.body.role);
    if (!role) return res.status(400).json({ message: 'Invalid role. Allowed roles are admin and viewer.' });

    try {
        const targetUser = await User.findOne({ where: { username: req.params.username } });
        if (!targetUser) return res.status(404).json({ message: 'User not found.' });

        const access = await getProjectAccess(req.params.id, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Project not found' });
        if (!isProjectAdmin(access, req.session.userId)) {
            return res.status(403).json({ message: 'Only project owner or admins can change roles.' });
        }
        if (Number(access.owner_id) === Number(targetUser.id)) {
            return res.status(400).json({ message: 'Cannot change the role of the project owner.' });
        }

        await ProjectMember.update(
            { role },
            { where: { project_id: req.params.id, user_id: targetUser.id } }
        );
        res.json({ message: `Member role updated to ${role}!` });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

module.exports = { addMember, listMembers, removeMember, updateMemberRole };
