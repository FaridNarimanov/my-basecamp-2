const { Message, User } = require('../models');
const { requireText } = require('../utils/validation');
const { getThreadAccess, getMessageAccess, isProjectAdmin } = require('../middleware/projectAccess');

const listMessages = async (req, res) => {
    try {
        const access = await getThreadAccess(req.params.threadId, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Thread not found.' });
        const canManage = isProjectAdmin(access, req.session.userId);

        const messages = await Message.findAll({
            where: { thread_id: req.params.threadId },
            include: [{ model: User, as: 'author', attributes: ['name', 'username', 'profile_pic', 'email'] }],
            order: [['created_at', 'ASC'], ['id', 'ASC']]
        });

        const rows = messages.map((message) => {
            const data = message.toJSON();
            data.user_name = data.author ? data.author.name : '';
            data.username = data.author ? data.author.username : '';
            data.profile_pic = data.author ? data.author.profile_pic : null;
            data.user_email = data.author ? data.author.email : '';
            delete data.author;
            return data;
        });

        res.json({ messages: rows, current_user_id: req.session.userId, can_manage: canManage });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const createMessage = async (req, res) => {
    const content = requireText(req.body.content, 'Message content');
    if (content.error) return res.status(400).json({ message: 'Message content is required.' });
    if (content.value.length > 2000) return res.status(400).json({ message: 'Message content must be 2000 characters or less.' });

    try {
        const access = await getThreadAccess(req.params.threadId, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Thread not found.' });

        const message = await Message.create({
            thread_id: req.params.threadId,
            user_id: req.session.userId,
            content: content.value
        });
        await access.thread.update({ updated_at: new Date() });
        res.status(201).json({ message: 'Message created', id: message.id });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const updateMessage = async (req, res) => {
    const content = requireText(req.body.content, 'Message content');
    if (content.error) return res.status(400).json({ message: 'Message content is required.' });
    if (content.value.length > 2000) return res.status(400).json({ message: 'Message content must be 2000 characters or less.' });

    try {
        const access = await getMessageAccess(req.params.messageId, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Message not found.' });
        const canManage = isProjectAdmin(access, req.session.userId);
        const isAuthor = Number(access.message.user_id) === Number(req.session.userId);
        if (!isAuthor && !canManage) {
            return res.status(403).json({ message: 'Only the message author, project owner, or admins can edit this message.' });
        }

        await access.message.update({ content: content.value });
        await access.thread.update({ updated_at: new Date() });
        res.json({ message: 'Message updated' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const access = await getMessageAccess(req.params.messageId, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Message not found.' });
        const canManage = isProjectAdmin(access, req.session.userId);
        const isAuthor = Number(access.message.user_id) === Number(req.session.userId);
        if (!isAuthor && !canManage) {
            return res.status(403).json({ message: 'Only the message author, project owner, or admins can delete this message.' });
        }

        await access.message.destroy();
        await access.thread.update({ updated_at: new Date() });
        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

module.exports = { listMessages, createMessage, updateMessage, deleteMessage };
