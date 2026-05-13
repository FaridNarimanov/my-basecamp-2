const { User } = require('../models');

const requireAdmin = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }

        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'role']
        });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }

        req.currentUser = user;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { requireAdmin };
