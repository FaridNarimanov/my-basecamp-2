const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/users', authController.register);
router.post('/sessions', authController.login);
router.delete('/sessions', authController.logout);

module.exports = router;
