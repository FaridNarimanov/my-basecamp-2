const express = require('express');
const userController = require('../controllers/userController');
const { requireLogin } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

router.get('/api/me', requireLogin, userController.showCurrentUser);
router.get('/admin/users', requireAdmin, userController.listAdminUsers);
router.patch('/users/:id/admin', requireAdmin, userController.makeAdmin);
router.delete('/users/:id/admin', requireAdmin, userController.removeAdmin);
router.delete('/users/:id', requireLogin, userController.deleteUser);
router.get('/api/users/:username', requireLogin, userController.showPublicUser);
router.get('/users/:username', requireLogin, userController.showPublicUser);

module.exports = router;
