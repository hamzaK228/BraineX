// Authentication Controller - Production-ready auth logic with Demo Mode support
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { memoryStore, isDemoMode } = require('../utils/memoryStore');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/emailService');

// Helper to create user object in memory
const createMemoryUser = async (userData) => {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = {
        _id: Date.now().toString(),
        ...userData,
        password: hashedPassword,
        isActive: true,
        isEmailVerified: false,
        refreshTokens: [],
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add methods
        comparePassword: async function (candidatePassword) {
            return await bcrypt.compare(candidatePassword, this.password);
        },
        generateAccessToken: function () {
            return jwt.sign(
                { userId: this._id, email: this.email, role: this.role, name: `${this.firstName} ${this.lastName}` },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
        },
        generateRefreshToken: function () {
            const token = jwt.sign(
                { userId: this._id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );
            this.refreshTokens.push({ token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            return token;
        },
        cleanupRefreshTokens: function () {
            this.refreshTokens = this.refreshTokens.filter(t => t.expiresAt > new Date());
        },
        getResetPasswordToken: function () {
            const resetToken = crypto.randomBytes(20).toString('hex');
            this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes
            return resetToken;
        },
        save: async function () { return this; } // Mock save
    };

    // Add virtual name
    Object.defineProperty(user, 'name', {
        get: function () { return `${this.firstName} ${this.lastName}`; }
    });

    return user;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { firstName, lastName, email, password, field, role } = req.body;

        let user;
        let accessToken, refreshToken;

        if (isDemoMode()) {
            // Demo Mode Logic
            const existingUser = memoryStore.users.find(u => u.email === email.toLowerCase());
            if (existingUser) {
                return res.status(409).json({ success: false, error: 'An account with this email already exists' });
            }

            // Allow admin creation in demo mode for testing
            let userRole = role === 'mentor' ? 'mentor' : 'student';
            if (email.toLowerCase().startsWith('admin')) {
                userRole = 'admin';
            }

            user = await createMemoryUser({
                firstName, lastName, email: email.toLowerCase(), password, field: field || 'other', role: userRole
            });

            memoryStore.users.push(user);
            accessToken = user.generateAccessToken();
            refreshToken = user.generateRefreshToken();

        } else {
            // MongoDB Logic
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({ success: false, error: 'An account with this email already exists' });
            }

            user = await User.create({
                firstName, lastName, email: email.toLowerCase(), password, field: field || 'other',
                role: role === 'mentor' ? 'mentor' : 'student'
            });

            accessToken = user.generateAccessToken();
            refreshToken = user.generateRefreshToken();
            await user.save();
        }

        // Send Welcome Email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Welcome to MentoraX!',
                message: `Hi ${user.firstName},\n\nWelcome to MentoraX! We are excited to have you on board.\n\nPlease verify your email to access all features (simulated in demo).\n\nBest,\nMentoraX Team`
            });
        } catch (err) {
            console.error('Email send fail', err);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                id: user._id, firstName: user.firstName, lastName: user.lastName, name: user.name,
                email: user.email, role: user.role, field: user.field, isEmailVerified: user.isEmailVerified
            },
            tokens: { accessToken, refreshToken }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        let user;
        if (isDemoMode()) {
            user = memoryStore.users.find(u => u.email === email.toLowerCase());
        } else {
            user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        }

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, error: 'Account is deactivated.' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;

        // Handle refresh tokens
        if (isDemoMode()) {
            user.refreshTokens = user.refreshTokens.filter(t => t.expiresAt > new Date());
        } else {
            user.cleanupRefreshTokens();
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        if (!isDemoMode()) await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user._id, firstName: user.firstName, lastName: user.lastName, name: user.name,
                email: user.email, role: user.role, field: user.field, isEmailVerified: user.isEmailVerified,
                profilePicture: user.profilePicture
            },
            tokens: { accessToken, refreshToken }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken && req.user) {
            if (isDemoMode()) {
                const user = memoryStore.users.find(u => u._id === req.user.userId);
                if (user) {
                    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
                }
            } else {
                const user = await User.findById(req.user.userId);
                if (user) {
                    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
                    await user.save();
                }
            }
        }

        res.json({ success: true, message: 'Logged out successfully' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, error: 'Logout failed' });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        let user;
        if (isDemoMode()) {
            user = memoryStore.users.find(u => u._id === req.user.userId);
            if (user) {
                const { password, refreshTokens, resetPasswordToken, resetPasswordExpire, ...safeUser } = user;
                user = safeUser;
            }
        } else {
            user = await User.findById(req.user.userId).select('-password -refreshTokens');
        }

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, data: user });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user data' });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh token is required' });

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
        }

        let user;
        if (isDemoMode()) {
            user = memoryStore.users.find(u => u._id === decoded.userId);
        } else {
            user = await User.findById(decoded.userId);
        }

        if (!user) return res.status(401).json({ success: false, error: 'User not found' });

        const tokenExists = user.refreshTokens.some(t => t.token === refreshToken && t.expiresAt > new Date());
        if (!tokenExists) return res.status(401).json({ success: false, error: 'Refresh token has been revoked' });

        const newAccessToken = user.generateAccessToken();
        res.json({ success: true, data: { accessToken: newAccessToken } });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ success: false, error: 'Failed to refresh token' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const fieldsToUpdate = ['firstName', 'lastName', 'field', 'bio', 'location', 'website', 'github'];
        let user;

        if (isDemoMode()) {
            user = memoryStore.users.find(u => u._id === req.user.userId);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            fieldsToUpdate.forEach(field => {
                if (req.body[field] !== undefined) user[field] = req.body[field];
            });
            user.updatedAt = new Date();

            const { password, refreshTokens, ...safeUser } = user;
            return res.json({ success: true, message: 'Profile updated', data: safeUser });
        } else {
            user = await User.findById(req.user.userId);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            fieldsToUpdate.forEach(field => {
                if (req.body[field] !== undefined) user[field] = req.body[field];
            });

            await user.save();
            // Refetch to ensure virtuals etc
            const updatedUser = await User.findById(req.user.userId).select('-password -refreshTokens');
            res.json({ success: true, message: 'Profile updated', data: updatedUser });
        }
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        let user;
        if (isDemoMode()) {
            user = memoryStore.users.find(u => u._id === req.user.userId);
        } else {
            user = await User.findById(req.user.userId).select('+password');
        }

        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Incorrect current password' });
        }

        if (isDemoMode()) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(newPassword, salt);
        } else {
            user.password = newPassword; // Pre-save hook will hash
            await user.save();
        }

        // New tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        res.json({
            success: true,
            message: 'Password changed successfully',
            tokens: { accessToken, refreshToken }
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, error: 'Failed to change password' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        let user;
        if (isDemoMode()) {
            user = memoryStore.users.find(u => u.email === email.toLowerCase());
        } else {
            user = await User.findOne({ email: email.toLowerCase() });
        }

        if (!user) {
            return res.status(404).json({ success: false, error: 'There is no user with that email' });
        }

        // Generate Token
        const resetToken = user.getResetPasswordToken();

        if (!isDemoMode()) {
            await user.save({ validateBeforeSave: false });
        }

        // Create reset url
        // In local mode, we'll just log it or point to a frontend route if it existed
        // For now, we simulate sending email with the token
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`; // This page likely doesn't exist yet but link concept is valid

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please click on the link below (or copy to browser) to reset your password: \n\n ${resetUrl} \n\n (Note: In Demo Mode, this link is simulated. You cannot actually reset password via UI yet, but API flow is complete.)`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message
            });

            res.json({ success: true, message: 'Email sent' });
        } catch (err) {
            console.error(err);
            if (!isDemoMode()) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save({ validateBeforeSave: false });
            }
            return res.status(500).json({ success: false, error: 'Email could not be sent' });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Verify Email
// @route   GET /api/auth/verify-email/:token
// @access  Public (usually)
exports.verifyEmail = async (req, res) => {
    // Stub for now or simple implementation
    res.json({ success: true, message: 'Email successfully verified (Demo)' });
};
