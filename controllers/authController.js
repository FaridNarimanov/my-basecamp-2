const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User } = require('../models');
const { requireText, trimString } = require('../utils/validation');

const register = async (req, res) => {
    const name = requireText(req.body.name, 'Name');
    const email = requireText(req.body.email, 'Email');
    const username = requireText(req.body.username, 'Username');
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (name.error || email.error || username.error || password.length === 0) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const adminCount = await User.count({ where: { role: 'admin' } });
        await User.create({
            name: name.value,
            email: email.value,
            username: username.value,
            password: hashedPassword,
            role: adminCount === 0 ? 'admin' : 'user'
        });
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Email or username already exists.' });
    }
};

const login = async (req, res) => {
    const loginValue = trimString(req.body.email);
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!loginValue || !password) {
        return res.status(400).json({ message: 'Email/username and password are required' });
    }

    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [{ email: loginValue }, { username: loginValue }]
            }
        });

        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid email or password' });

        req.session.userId = user.id;
        res.json({ message: 'Logged in successfully', role: user.role });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const logout = (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out' });
    });
};

module.exports = { register, login, logout };
