const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User } = require('../models');
const { requireText } = require('../utils/validation');
const { safeDeleteUpload } = require('../utils/projectCleanup');

const showProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['name', 'email', 'profile_pic', 'username']
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const updateProfile = async (req, res) => {
    const name = requireText(req.body.name, 'Name');
    const email = requireText(req.body.email, 'Email');
    const username = requireText(req.body.username, 'Username');
    const oldPassword = typeof req.body.oldPassword === 'string' ? req.body.oldPassword : '';
    const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';
    const hasNewPassword = typeof req.body.newPassword === 'string' && req.body.newPassword.length > 0;

    if (name.error || email.error || username.error) {
        return res.status(400).json({ message: 'Name, email, and username are required.' });
    }

    try {
        const existing = await User.findOne({
            where: {
                username: username.value,
                id: { [Op.ne]: req.session.userId }
            }
        });
        if (existing) return res.status(400).json({ message: 'This username is already taken.' });

        const user = await User.findByPk(req.session.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updates = { name: name.value, email: email.value, username: username.value };
        if (hasNewPassword) {
            const match = await bcrypt.compare(oldPassword, user.password);
            if (!match) return res.status(401).json({ message: 'Incorrect current password.' });
            updates.password = await bcrypt.hash(newPassword, 10);
        }

        await user.update(updates);
        res.json({ message: hasNewPassword ? 'Profile and password updated successfully!' : 'Profile updated successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const uploadProfilePicture = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = '/uploads/' + req.file.filename;

    try {
        const user = await User.findByPk(req.session.userId);
        if (!user) {
            await safeDeleteUpload(filePath);
            return res.status(404).json({ message: 'User not found' });
        }

        const oldPath = user.profile_pic;
        await user.update({ profile_pic: filePath });

        if (oldPath && oldPath !== filePath) {
            try {
                await safeDeleteUpload(oldPath);
            } catch (deleteErr) {
                console.error('Could not delete old profile picture:', deleteErr.message);
            }
        }

        res.json({ message: 'Profile picture updated!', filePath });
    } catch (err) {
        await safeDeleteUpload(filePath);
        res.status(500).json({ message: 'Database error' });
    }
};

module.exports = { showProfile, updateProfile, uploadProfilePicture };
