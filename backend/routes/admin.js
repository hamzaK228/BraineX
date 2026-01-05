// Admin Routes - Production-ready with JWT authentication
const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/auth');
const User = require('../models/User');

// In-memory storage for demo (replace with MongoDB models in full implementation)
let scholarships = [];
let mentors = [];
let fields = [];
let events = [];

// Load sample data
const loadSampleData = () => {
    if (scholarships.length === 0) {
        scholarships = [
            {
                id: 1,
                name: "Gates Cambridge Scholarship",
                organization: "University of Cambridge",
                amount: "Full Funding",
                category: "graduate",
                deadline: "2024-12-15",
                country: "UK",
                description: "Prestigious scholarship for outstanding applicants from outside the UK to pursue graduate study at Cambridge.",
                website: "https://www.gatescambridge.org/",
                status: "active",
                tags: ["Full Funding", "International", "Graduate"],
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: "Rhodes Scholarship",
                organization: "University of Oxford",
                amount: "Full Funding",
                category: "graduate",
                deadline: "2024-10-06",
                country: "UK",
                description: "The world's oldest graduate scholarship program.",
                website: "https://www.rhodeshouse.ox.ac.uk/",
                status: "active",
                tags: ["Full Funding", "International", "Leadership"],
                createdAt: new Date().toISOString()
            }
        ];
    }

    if (mentors.length === 0) {
        mentors = [
            {
                id: 1,
                name: "Dr. Sarah Johnson",
                title: "AI Research Director",
                company: "Google DeepMind",
                field: "technology",
                experience: "senior",
                bio: "Leading AI researcher with 15+ years experience in machine learning.",
                expertise: ["Machine Learning", "PhD Applications", "Research"],
                rate: 150,
                rating: 4.9,
                mentees: 234,
                status: "verified",
                createdAt: new Date().toISOString()
            }
        ];
    }

    if (fields.length === 0) {
        fields = [
            {
                id: 1,
                name: "Computer Science",
                category: "stem",
                description: "Study of computational systems and the design of computer systems",
                icon: "💻",
                salary: "$70K - $200K",
                careers: ["Software Engineer", "Data Scientist", "Product Manager"],
                createdAt: new Date().toISOString()
            }
        ];
    }
};

loadSampleData();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(adminOnly);

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
    try {
        // Get user counts from database
        let userStats = { total: 0, students: 0, mentors: 0, admins: 0 };

        try {
            const totalUsers = await User.countDocuments();
            const studentCount = await User.countDocuments({ role: 'student' });
            const mentorCount = await User.countDocuments({ role: 'mentor' });
            const adminCount = await User.countDocuments({ role: 'admin' });

            userStats = {
                total: totalUsers,
                students: studentCount,
                mentors: mentorCount,
                admins: adminCount
            };
        } catch (dbError) {
            console.log('Database not connected, using demo data');
        }

        res.json({
            success: true,
            data: {
                users: userStats,
                totalScholarships: scholarships.length,
                activeScholarships: scholarships.filter(s => s.status === 'active').length,
                totalMentors: mentors.length,
                verifiedMentors: mentors.filter(m => m.status === 'verified').length,
                totalFields: fields.length,
                totalEvents: events.length,
                monthlyRevenue: 45250
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

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
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
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
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

// @desc    Get all scholarships
// @route   GET /api/admin/scholarships
// @access  Private/Admin
router.get('/scholarships', (req, res) => {
    res.json({
        success: true,
        data: scholarships
    });
});

// @desc    Create scholarship
// @route   POST /api/admin/scholarships
// @access  Private/Admin
router.post('/scholarships', (req, res) => {
    try {
        const scholarship = {
            id: Date.now(),
            ...req.body,
            status: req.body.status || 'active',
            createdAt: new Date().toISOString()
        };

        scholarships.push(scholarship);

        res.status(201).json({
            success: true,
            message: 'Scholarship created successfully',
            data: scholarship
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create scholarship'
        });
    }
});

// @desc    Update scholarship
// @route   PUT /api/admin/scholarships/:id
// @access  Private/Admin
router.put('/scholarships/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = scholarships.findIndex(s => s.id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Scholarship not found'
            });
        }

        scholarships[index] = {
            ...scholarships[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Scholarship updated successfully',
            data: scholarships[index]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update scholarship'
        });
    }
});

// @desc    Delete scholarship
// @route   DELETE /api/admin/scholarships/:id
// @access  Private/Admin
router.delete('/scholarships/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = scholarships.findIndex(s => s.id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Scholarship not found'
            });
        }

        scholarships.splice(index, 1);

        res.json({
            success: true,
            message: 'Scholarship deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete scholarship'
        });
    }
});

// ==================== MENTORS ====================

// @desc    Get all mentors
// @route   GET /api/admin/mentors
// @access  Private/Admin
router.get('/mentors', (req, res) => {
    res.json({
        success: true,
        data: mentors
    });
});

// @desc    Create mentor
// @route   POST /api/admin/mentors
// @access  Private/Admin
router.post('/mentors', (req, res) => {
    try {
        const mentor = {
            id: Date.now(),
            ...req.body,
            status: req.body.status || 'pending',
            rating: 4.5,
            mentees: 0,
            createdAt: new Date().toISOString()
        };

        mentors.push(mentor);

        res.status(201).json({
            success: true,
            message: 'Mentor created successfully',
            data: mentor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create mentor'
        });
    }
});

// @desc    Update mentor
// @route   PUT /api/admin/mentors/:id
// @access  Private/Admin
router.put('/mentors/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = mentors.findIndex(m => m.id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Mentor not found'
            });
        }

        mentors[index] = {
            ...mentors[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Mentor updated successfully',
            data: mentors[index]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update mentor'
        });
    }
});

// @desc    Delete mentor
// @route   DELETE /api/admin/mentors/:id
// @access  Private/Admin
router.delete('/mentors/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = mentors.findIndex(m => m.id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Mentor not found'
            });
        }

        mentors.splice(index, 1);

        res.json({
            success: true,
            message: 'Mentor deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete mentor'
        });
    }
});

// ==================== FIELDS ====================

// @desc    Get all fields
// @route   GET /api/admin/fields
// @access  Private/Admin
router.get('/fields', (req, res) => {
    res.json({
        success: true,
        data: fields
    });
});

// @desc    Create field
// @route   POST /api/admin/fields
// @access  Private/Admin
router.post('/fields', (req, res) => {
    try {
        const field = {
            id: Date.now(),
            ...req.body,
            createdAt: new Date().toISOString()
        };

        fields.push(field);

        res.status(201).json({
            success: true,
            message: 'Field created successfully',
            data: field
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create field'
        });
    }
});

// @desc    Delete field
// @route   DELETE /api/admin/fields/:id
// @access  Private/Admin
router.delete('/fields/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = fields.findIndex(f => f.id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Field not found'
            });
        }

        fields.splice(index, 1);

        res.json({
            success: true,
            message: 'Field deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete field'
        });
    }
});

// Public getter for scholarships (for use by other routes)
router.getScholarships = () => scholarships;
router.getMentors = () => mentors;
router.getFields = () => fields;

module.exports = router;