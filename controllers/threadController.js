const { sequelize, Thread, Message, User } = require('../models');
const { requireText } = require('../utils/validation');
const { getProjectAccess, getThreadAccess, isProjectAdmin } = require('../middleware/projectAccess');

const listThreads = async (req, res) => {
    try {
        const access = await getProjectAccess(req.params.id, req.session.userId);
        if (!access) return res.status(403).json({ message: 'Access denied.' });

        const threads = await Thread.findAll({
            where: { project_id: req.params.id },
            include: [{ model: User, as: 'creator', attributes: ['name', 'username'] }],
            order: [['updated_at', 'DESC'], ['created_at', 'DESC']]
        });

        const rows = await Promise.all(threads.map(async (thread) => {
            const data = thread.toJSON();
            data.creator_name = data.creator ? data.creator.name : '';
            data.creator_username = data.creator ? data.creator.username : '';
            data.message_count = await Message.count({ where: { thread_id: thread.id } });
            delete data.creator;
            return data;
        }));

        res.json({ threads: rows, role: access.user_role, can_manage: access.can_manage });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const createThread = async (req, res) => {
    const title = requireText(req.body.title, 'Thread title');
    if (title.error) return res.status(400).json({ message: 'Thread title is required.' });
    if (title.value.length > 120) return res.status(400).json({ message: 'Thread title must be 120 characters or less.' });

    try {
        const access = await getProjectAccess(req.params.id, req.session.userId);
        if (!access) return res.status(403).json({ message: 'Access denied.' });
        if (!access.can_manage) {
            return res.status(403).json({ message: 'Only project owner or admins can create threads.' });
        }

        const thread = await Thread.create({
            project_id: req.params.id,
            title: title.value,
            created_by: req.session.userId
        });
        res.status(201).json({ message: 'Thread created', id: thread.id });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const updateThread = async (req, res) => {
    const title = requireText(req.body.title, 'Thread title');
    if (title.error) return res.status(400).json({ message: 'Thread title is required.' });
    if (title.value.length > 120) return res.status(400).json({ message: 'Thread title must be 120 characters or less.' });

    try {
        const access = await getThreadAccess(req.params.threadId, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Thread not found.' });
        if (!isProjectAdmin(access, req.session.userId)) {
            return res.status(403).json({ message: 'Only project owner or admins can edit threads.' });
        }

        await access.thread.update({ title: title.value });
        res.json({ message: 'Thread updated' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const deleteThread = async (req, res) => {
    try {
        const access = await getThreadAccess(req.params.threadId, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Thread not found.' });
        if (!isProjectAdmin(access, req.session.userId)) {
            return res.status(403).json({ message: 'Only project owner or admins can delete threads.' });
        }

        await sequelize.transaction(async (transaction) => {
            await Message.destroy({ where: { thread_id: req.params.threadId }, transaction });
            await Thread.destroy({ where: { id: req.params.threadId }, transaction });
        });

        res.json({ message: 'Thread deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

module.exports = { listThreads, createThread, updateThread, deleteThread };
