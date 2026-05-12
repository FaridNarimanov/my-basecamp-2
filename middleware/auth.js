const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    next();
};

module.exports = { requireLogin };
