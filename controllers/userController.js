const { Project, ProjectMember, Discussion, Message, User } = require('../models');
const { destroyProjectWithRelatedData, safeDeleteUpload } = require('../utils/projectCleanup');

const safeUserAttributes = ['id', 'name', 'username', 'email', 'role', 'profile_pic'];
const allowedGlobalRoles = new Set(['user', 'admin']);

const safeUser = (user) => {
    const data = user.toJSON ? user.toJSON() : user;
    return {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        role: allowedGlobalRoles.has(data.role) ? data.role : 'user',
        profile_pic: data.profile_pic || null
    };
};

const showCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, { attributes: safeUserAttributes });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const data = safeUser(user);
        delete data.profile_pic;
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const showPublicUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { username: req.params.username },
            attributes: ['name', 'username', 'email', 'profile_pic', 'role']
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const listAdminUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: safeUserAttributes,
            order: [['id', 'ASC']]
        });
        res.json(users.map(safeUser));
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const makeAdmin = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update({ role: 'admin' });
        res.json({ message: 'User is now a global admin', user: safeUser(user) });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const removeAdmin = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'admin') {
            await user.update({ role: 'user' });
            return res.json({ message: 'User is not a global admin', user: safeUser(user) });
        }

        const adminCount = await User.count({ where: { role: 'admin' } });
        if (adminCount <= 1) {
            return res.status(400).json({ message: 'Cannot remove the last global admin.' });
        }

        await user.update({ role: 'user' });
        res.json({ message: 'Global admin access removed', user: safeUser(user) });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const target = await User.findByPk(req.params.id);
        if (!target) return res.status(404).json({ message: 'User not found' });

        const current = await User.findByPk(req.session.userId, { attributes: ['id', 'role'] });
        if (!current) return res.status(401).json({ message: 'Unauthorized. Please log in.' });

        const deletingSelf = Number(current.id) === Number(target.id);
        const currentIsAdmin = current.role === 'admin';

        if (!deletingSelf && (!currentIsAdmin || target.role === 'admin')) {
            return res.status(403).json({ message: 'Only global admins can delete non-admin users.' });
        }

        if (target.role === 'admin') {
            const adminCount = await User.count({ where: { role: 'admin' } });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last global admin.' });
            }
        }

        const ownedProjects = await Project.findAll({
            where: { user_id: target.id },
            attributes: ['id']
        });

        for (const project of ownedProjects) {
            await destroyProjectWithRelatedData(project.id, target.id);
        }

        await ProjectMember.destroy({ where: { user_id: target.id } });
        await Discussion.destroy({ where: { user_id: target.id } });
        await Message.destroy({ where: { user_id: target.id } });

        const profilePic = target.profile_pic;
        await target.destroy();
        if (profilePic) await safeDeleteUpload(profilePic);

        if (deletingSelf) {
            return req.session.destroy(() => {
                res.json({ message: 'Account deleted successfully' });
            });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

module.exports = {
    showCurrentUser,
    showPublicUser,
    listAdminUsers,
    makeAdmin,
    removeAdmin,
    deleteUser
};
