const express = require('express');
const { check } = require('express-validator');
const { register, login, generateInvitationCode, getProfile, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
    check('email').isEmail(),
    check('password').isLength({ min: 6 }),
    check('name').notEmpty()
], register);

// Login user
router.post('/login', login);

// Generate invitation code (protected, admin only)
router.post('/invitation-code', auth, generateInvitationCode);

// Get current user profile
router.get('/profile', auth, getProfile);

// Update user profile
router.patch('/profile', auth, updateProfile);

module.exports = router; 