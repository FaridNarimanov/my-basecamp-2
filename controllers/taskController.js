const { Task } = require('../models');
const { requireText } = require('../utils/validation');
const { getProjectAccess } = require('../middleware/projectAccess');

const listTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { project_id: req.params.id },
            order: [['id', 'DESC']]
        });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const createTask = async (req, res) => {
    const content = requireText(req.body.content, 'Task content');
    if (content.error) return res.status(400).json({ message: 'Task content is required.' });

    try {
        const task = await Task.create({
            project_id: req.params.id,
            content: content.value
        });
        res.status(201).json({ message: 'Task added', id: task.id });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const access = await getProjectAccess(task.project_id, req.session.userId);
        if (!access) return res.status(403).json({ message: 'Access denied.' });

        await task.update({ is_completed: Boolean(req.body.is_completed) });
        res.json({ message: 'Task updated' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

module.exports = { listTasks, createTask, updateTask };
