// Admin Routes - Production-ready with Dual Mode (Mongo/Memory)
const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Mentor = require('../models/Mentor');
const Field = require('../models/Field');
const { memoryStore, isDemoMode } = require('../utils/memoryStore');

// Controllers
const scholarshipController = require('../controllers/scholarshipController');
const mentorController = require('../controllers/mentorController');
const fieldController = require('../controllers/fieldController');

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(adminOnly);

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
    try {
        let stats = {
            totalUsers: 0,
            activeStudents: 0,
            activeMentors: 0,
            totalScholarships: 0,
            totalMentors: 0,
            totalFields: 0,
            totalEvents: 0
        };

        if (isDemoMode()) {
            stats.totalUsers = memoryStore.users.length;
            stats.activeStudents = memoryStore.users.filter(u => u.role === 'student').length;
            stats.activeMentors = memoryStore.users.filter(u => u.role === 'mentor').length; // Users with mentor role
            stats.totalScholarships = memoryStore.scholarships.length;
            stats.totalMentors = memoryStore.mentors.length; // Mentor profiles
            stats.totalFields = memoryStore.fields.length;
            stats.totalEvents = memoryStore.events.length || 0;
            stats.verifiedMentors = memoryStore.mentors.filter(m => m.status === 'verified').length;
            stats.activeScholarships = memoryStore.scholarships.filter(s => s.status === 'active').length;
        } else {
            stats.totalUsers = await User.countDocuments();
            stats.activeStudents = await User.countDocuments({ role: 'student' });
            stats.activeMentors = await User.countDocuments({ role: 'mentor' });
            stats.totalScholarships = await Scholarship.countDocuments();
            stats.totalMentors = await Mentor.countDocuments();
            stats.totalFields = await Field.countDocuments();
            stats.totalEvents = 0; // Replace with Event model if created

            // Additional specific counts if needed
            stats.verifiedMentors = await Mentor.countDocuments({ status: 'verified' });
            stats.activeScholarships = await Scholarship.countDocuments({ status: 'active' });
        }

        res.json({
            success: true,
            data: {
                users: {
                    total: stats.totalUsers,
                    students: stats.activeStudents,
                    mentors: stats.activeMentors,
                    admins: stats.totalUsers - stats.activeStudents - stats.activeMentors
                },
                totalScholarships: stats.totalScholarships,
                activeScholarships: stats.activeScholarships,
                totalMentors: stats.totalMentors,
                verifiedMentors: stats.verifiedMentors,
                totalFields: stats.totalFields,
                totalEvents: stats.totalEvents,
                monthlyRevenue: 45250 // Mock revenue for now
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || '';

        if (isDemoMode()) {
            let users = [...memoryStore.users]; // Copy array

            // Filter
            if (role) {
                users = users.filter(u => u.role === role);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                users = users.filter(u =>
                    u.firstName.toLowerCase().includes(searchLower) ||
                    u.lastName.toLowerCase().includes(searchLower) ||
                    u.email.toLowerCase().includes(searchLower)
                );
            }

            const total = users.length;

            // Sort (newest first)
            users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Paginate
            const paginatedUsers = users.slice(skip, skip + limit).map(u => {
                const { password, refreshTokens, ...userWithoutSensitive } = u;
                return userWithoutSensitive;
            });

            return res.json({
                success: true,
                data: {
                    users: paginatedUsers,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        }

        // MongoDB
        let query = {};
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password -refreshTokens')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

// @desc    Update user (activate/deactivate, change role)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
    try {
        const { isActive, role } = req.body;
        const updates = {};
        if (typeof isActive === 'boolean') updates.isActive = isActive;
        if (role && ['student', 'mentor', 'admin'].includes(role)) updates.role = role;

        if (isDemoMode()) {
            const index = memoryStore.users.findIndex(u => u._id.toString() === req.params.id); // In demo, _id is ObjectId string

            if (index === -1) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            memoryStore.users[index] = { ...memoryStore.users[index], ...updates };

            const { password, refreshTokens, ...userWithoutSensitive } = memoryStore.users[index];

            return res.json({
                success: true,
                message: 'User updated successfully',
                data: userWithoutSensitive
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user'
        });
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
    try {
        if (isDemoMode()) {
            const index = memoryStore.users.findIndex(u => u._id.toString() === req.params.id);

            if (index === -1) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            memoryStore.users.splice(index, 1);
            return res.json({
                success: true,
                message: 'User deleted successfully'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
});

// ==================== SCHOLARSHIPS ====================
router.get('/scholarships', scholarshipController.getAdminScholarships);
router.post('/scholarships', scholarshipController.createScholarship);
router.put('/scholarships/:id', scholarshipController.updateScholarship);
router.delete('/scholarships/:id', scholarshipController.deleteScholarship);

// ==================== MENTORS ====================
router.get('/mentors', mentorController.getAdminMentors);
router.post('/mentors', mentorController.createMentor);
router.put('/mentors/:id', mentorController.updateMentor);
router.delete('/mentors/:id', mentorController.deleteMentor);

// ==================== FIELDS ====================
// Fields don't have a status, so standard getFields (which filters by nothing if no params) is fine
// But create/update/delete are admin restricted in the controller routes?
// Actually the controller methods I wrote for create/update/delete are generic handlers.
// Checking routes/fields.js: it only exposes get.
// So I need to expose create/update/delete here.
router.get('/fields', fieldController.getFields);
router.post('/fields', fieldController.createField);
router.put('/fields/:id', fieldController.updateField);
router.delete('/fields/:id', fieldController.deleteField);

module.exports = router;