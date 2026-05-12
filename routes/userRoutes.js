const express = require('express');
const userController = require('../controllers/userController');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

router.get('/api/users/:username', requireLogin, userController.showPublicUser);
router.get('/users/:username', requireLogin, userController.showPublicUser);

module.exports = router;
