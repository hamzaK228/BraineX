const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// User registration
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, field } = req.body;
        const result = await authService.registerUser({ firstName, lastName, email, password, field });
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser({ email, password });
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// User logout
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Get current user
router.get('/current-user', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({
            success: false,
            error: 'Not authenticated'
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Check for admin token
    if (token === 'admin-token-demo') {
        return res.json({
            success: true,
            user: {
                id: 1,
                name: 'Admin User',
                email: 'admin@mentorax.com',
                role: 'admin',
                avatar: '👨‍💼'
            }
        });
    }
    
    // Check for regular user token
    if (token === 'user-token-demo') {
        // Find the user in database
        const user = authService.getLatestUser();
        if (user) {
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: 'user',
                    avatar: '👤'
                }
            });
        }
    }
    
    res.json({
        success: false,
        error: 'Invalid token'
    });
});

module.exports = router;