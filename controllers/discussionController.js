const { Discussion, User } = require('../models');
const { requireText } = require('../utils/validation');

const listDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.findAll({
            where: { project_id: req.params.id },
            include: [{ model: User, as: 'author', attributes: ['name', 'username', 'profile_pic', 'email'] }],
            order: [['created_at', 'DESC']]
        });

        res.json(discussions.map((discussion) => {
            const data = discussion.toJSON();
            data.user_name = data.author ? data.author.name : '';
            data.username = data.author ? data.author.username : '';
            data.profile_pic = data.author ? data.author.profile_pic : null;
            data.user_email = data.author ? data.author.email : '';
            delete data.author;
            return data;
        }));
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const createDiscussion = async (req, res) => {
    const content = requireText(req.body.content, 'Discussion content');
    if (content.error) return res.status(400).json({ message: 'Discussion content is required.' });

    try {
        await Discussion.create({
            project_id: req.params.id,
            user_id: req.session.userId,
            content: content.value
        });
        res.status(201).json({ message: 'Discussion added' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

module.exports = { listDiscussions, createDiscussion };
