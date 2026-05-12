const express = require('express');
const path = require('path');
const session = require('express-session');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const threadRoutes = require('./routes/threadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { uploadErrorHandler } = require('./middleware/upload');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (req.path.endsWith('.html') && req.path.length > 5) {
        const cleanPath = req.path.slice(0, -5);
        const query = Object.keys(req.query).length > 0 ? '?' + new URLSearchParams(req.query).toString() : '';
        return res.redirect(301, cleanPath + query);
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'basecamp_dev_secret_change_in_prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.use(authRoutes);
app.use(profileRoutes);
app.use(userRoutes);
app.use('/projects', projectRoutes);
app.use(threadRoutes);
app.use(messageRoutes);
app.use(taskRoutes);
app.use(uploadErrorHandler);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
});

sequelize.sync().then(() => {
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
