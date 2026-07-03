const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  verifyEmail,
  getProfile,
  updateProfile,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
