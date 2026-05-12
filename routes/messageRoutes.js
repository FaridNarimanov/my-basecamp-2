const express = require('express');
const messageController = require('../controllers/messageController');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

router.put('/messages/:messageId', requireLogin, messageController.updateMessage);
router.delete('/messages/:messageId', requireLogin, messageController.deleteMessage);

module.exports = router;
