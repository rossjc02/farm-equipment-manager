const User = require('../models/User');
const InvitationCode = require('../models/InvitationCode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate invitation code
const generateInvitationCode = async (req, res) => {
    try {
        // Only admin users should be able to generate codes
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to generate invitation codes' });
        }

        const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const invitationCode = new InvitationCode({ code });
        await invitationCode.save();

        res.status(201).json({ code });
    } catch (error) {
        console.error('Error generating invitation code:', error);
        res.status(500).json({ message: 'Error generating invitation code' });
    }
};

// Register user
const register = async (req, res) => {
    try {
        const { email, password, name, invitationCode } = req.body;

        // Check if invitation code exists and is valid
        const code = await InvitationCode.findOne({ code: invitationCode, isUsed: false });
        if (!code) {
            return res.status(400).json({ message: 'Invalid or used invitation code' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            email,
            password,
            name,
            role: 'user' // Default role
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        // Mark invitation code as used
        code.isUsed = true;
        code.usedBy = user._id;
        await code.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists (try both email and username fields)
        const user = await User.findOne({ 
            $or: [
                { email: email },
                { username: email }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'password'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }

        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
                firstName: req.user.firstName,
                lastName: req.user.lastName
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile' });
    }
};

module.exports = {
    register,
    login,
    generateInvitationCode,
    getProfile,
    updateProfile
}; 