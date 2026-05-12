const { User } = require('../models');

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

module.exports = { showPublicUser };
