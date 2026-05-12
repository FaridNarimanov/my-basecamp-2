const express = require('express');
const threadController = require('../controllers/threadController');
const messageController = require('../controllers/messageController');
const { requireLogin } = require('../middleware/auth');
const { requireProjectAccess } = require('../middleware/projectAccess');

const router = express.Router();

router.get('/projects/:id/threads', requireLogin, requireProjectAccess, threadController.listThreads);
router.post('/projects/:id/threads', requireLogin, requireProjectAccess, threadController.createThread);
router.put('/threads/:threadId', requireLogin, threadController.updateThread);
router.delete('/threads/:threadId', requireLogin, threadController.deleteThread);

router.get('/threads/:threadId/messages', requireLogin, messageController.listMessages);
router.post('/threads/:threadId/messages', requireLogin, messageController.createMessage);

module.exports = router;
