const express = require('express');
const profileController = require('../controllers/profileController');
const { requireLogin } = require('../middleware/auth');
const { handleAvatarUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/profile', requireLogin, profileController.showProfile);
router.put('/profile', requireLogin, profileController.updateProfile);
router.post('/profile/picture', requireLogin, handleAvatarUpload, profileController.uploadProfilePicture);

module.exports = router;
