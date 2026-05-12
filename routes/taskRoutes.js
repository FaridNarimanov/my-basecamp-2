const express = require('express');
const taskController = require('../controllers/taskController');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

router.patch('/tasks/:taskId', requireLogin, taskController.updateTask);

module.exports = router;
