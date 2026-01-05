// Authentication Middleware - JWT verification and role-based access
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'brainex-jwt-secret-change-in-production'
            );

            // Add user info to request
            req.user = decoded;

            // Optionally fetch full user from DB
            if (req.query.fullUser === 'true') {
                const user = await User.findById(decoded.userId);
                if (!user || !user.isActive) {
                    return res.status(401).json({
                        success: false,
                        error: 'User not found or deactivated'
                    });
                }
                req.fullUser = user;
            }

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED'
                });
            }
            throw jwtError;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Role '${req.user.role}' is not authorized for this action.`
            });
        }

        next();
    };
};

// Admin-only middleware
const adminOnly = authorize('admin');

// Mentor or admin middleware
const mentorOrAdmin = authorize('mentor', 'admin');

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'brainex-jwt-secret-change-in-production'
            );
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Token invalid but continue anyway
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    adminOnly,
    mentorOrAdmin,
    optionalAuth
};
