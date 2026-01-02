const express = require('express');
const router = express.Router();

// Authentication middleware for admin routes
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Simple token validation (use JWT in production)
    if (token !== 'admin-token-demo') {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    
    next();
}

// Admin dashboard stats
router.get('/stats', authenticateAdmin, (req, res) => {
    // In-memory database (replace with real database in production)
    const scholarships = [
        {
            id: 1,
            name: "Gates Cambridge Scholarship",
            organization: "University of Cambridge",
            amount: "Full Funding",
            category: "graduate",
            deadline: "2024-12-15",
            country: "UK",
            description: "Prestigious scholarship for outstanding applicants from outside the UK to pursue graduate study at Cambridge. Covers full cost of studying plus living expenses.",
            website: "https://www.gatescambridge.org/",
            eligibility: "International students (non-UK)",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Full Funding", "International", "Graduate", "Prestigious"],
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
            description: "The world's oldest graduate scholarship program, enabling exceptional young people from around the world to study at Oxford.",
            website: "https://www.rhodeshouse.ox.ac.uk/",
            eligibility: "Citizens of eligible countries",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Full Funding", "International", "Leadership", "Oxford"],
            createdAt: new Date().toISOString()
        }
    ];

    const mentors = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            title: "AI Research Director",
            company: "Google DeepMind",
            field: "technology",
            experience: "senior",
            bio: "Leading AI researcher with 15+ years experience in machine learning and neural networks.",
            expertise: ["Machine Learning", "PhD Applications", "Research Methods"],
            rate: 150,
            rating: 4.9,
            mentees: 234,
            sessions: 890,
            status: "verified",
            createdAt: new Date().toISOString()
        }
    ];

    const fields = [
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

    // In-memory users (from authService)
    const users = []; // This would come from authService in a real implementation

    // In-memory applications (from applications route)
    const applications = []; // This would come from the applications service

    res.json({
        success: true,
        data: {
            totalUsers: users.length,
            totalScholarships: scholarships.length,
            totalMentors: mentors.length,
            totalApplications: applications.length,
            monthlyRevenue: 45250,
            activeScholarships: scholarships.filter(s => s.status === 'active').length,
            verifiedMentors: mentors.filter(m => m.status === 'verified').length
        }
    });
});

// Get all data for admin
router.get('/scholarships', authenticateAdmin, (req, res) => {
    const scholarships = [
        {
            id: 1,
            name: "Gates Cambridge Scholarship",
            organization: "University of Cambridge",
            amount: "Full Funding",
            category: "graduate",
            deadline: "2024-12-15",
            country: "UK",
            description: "Prestigious scholarship for outstanding applicants from outside the UK to pursue graduate study at Cambridge. Covers full cost of studying plus living expenses.",
            website: "https://www.gatescambridge.org/",
            eligibility: "International students (non-UK)",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Full Funding", "International", "Graduate", "Prestigious"],
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
            description: "The world's oldest graduate scholarship program, enabling exceptional young people from around the world to study at Oxford.",
            website: "https://www.rhodeshouse.ox.ac.uk/",
            eligibility: "Citizens of eligible countries",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Full Funding", "International", "Leadership", "Oxford"],
            createdAt: new Date().toISOString()
        }
    ];

    res.json({
        success: true,
        data: scholarships
    });
});

router.get('/mentors', authenticateAdmin, (req, res) => {
    const mentors = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            title: "AI Research Director",
            company: "Google DeepMind",
            field: "technology",
            experience: "senior",
            bio: "Leading AI researcher with 15+ years experience in machine learning and neural networks.",
            expertise: ["Machine Learning", "PhD Applications", "Research Methods"],
            rate: 150,
            rating: 4.9,
            mentees: 234,
            sessions: 890,
            status: "verified",
            createdAt: new Date().toISOString()
        }
    ];

    res.json({
        success: true,
        data: mentors
    });
});

router.get('/fields', authenticateAdmin, (req, res) => {
    const fields = [
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

    res.json({
        success: true,
        data: fields
    });
});

router.get('/users', authenticateAdmin, (req, res) => {
    // In-memory users (from authService)
    const users = []; // This would come from authService in a real implementation

    res.json({
        success: true,
        data: users
    });
});

// Create scholarship
router.post('/scholarships', authenticateAdmin, (req, res) => {
    try {
        const scholarship = {
            id: Date.now(),
            ...req.body,
            status: req.body.status || 'active',
            createdAt: new Date().toISOString()
        };
        
        // In a real app, this would be added to the database
        // scholarships.push(scholarship);
        
        res.json({
            success: true,
            data: scholarship,
            message: 'Scholarship created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create scholarship'
        });
    }
});

// Update scholarship
router.put('/scholarships/:id', authenticateAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // In a real app, this would update the database
        // const index = scholarships.findIndex(s => s.id === id);
        
        // if (index === -1) {
        //     return res.status(404).json({
        //         success: false,
        //         error: 'Scholarship not found'
        //     });
        // }
        
        // scholarships[index] = {
        //     ...scholarships[index],
        //     ...req.body,
        //     updatedAt: new Date().toISOString()
        // };
        
        const updatedScholarship = {
            id: id,
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: updatedScholarship,
            message: 'Scholarship updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update scholarship'
        });
    }
});

// Delete scholarship
router.delete('/scholarships/:id', authenticateAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // In a real app, this would delete from the database
        // const index = scholarships.findIndex(s => s.id === id);
        
        // if (index === -1) {
        //     return res.status(404).json({
        //         success: false,
        //         error: 'Scholarship not found'
        //     });
        // }
        
        // scholarships.splice(index, 1);
        
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

// Create mentor
router.post('/mentors', authenticateAdmin, (req, res) => {
    try {
        const mentor = {
            id: Date.now(),
            ...req.body,
            status: req.body.status || 'pending',
            rating: 4.5,
            mentees: 0,
            sessions: 0,
            createdAt: new Date().toISOString()
        };
        
        // In a real app, this would be added to the database
        // mentors.push(mentor);
        
        res.json({
            success: true,
            data: mentor,
            message: 'Mentor created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create mentor'
        });
    }
});

// Create field
router.post('/fields', authenticateAdmin, (req, res) => {
    try {
        const field = {
            id: Date.now(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        // In a real app, this would be added to the database
        // fields.push(field);
        
        res.json({
            success: true,
            data: field,
            message: 'Field created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create field'
        });
    }
});

// Get all applications (for admin)
router.get('/applications', authenticateAdmin, (req, res) => {
    // In-memory applications (from applications route)
    const applications = []; // This would come from the applications service

    res.json({
        success: true,
        data: applications,
        total: applications.length
    });
});

// Update application status (admin only)
router.put('/applications/:id', authenticateAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, notes } = req.body;
        
        // In a real app, this would update the database
        // const index = applications.findIndex(a => a.id === id);
        
        // if (index === -1) {
        //     return res.status(404).json({
        //         success: false,
        //         error: 'Application not found'
        //     });
        // }
        
        const updatedApplication = {
            id: id,
            status: status || 'submitted', // default status
            notes: notes || '',
            updatedAt: new Date().toISOString(),
            reviewedBy: 'Admin',
            reviewedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: updatedApplication,
            message: 'Application updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update application'
        });
    }
});

module.exports = router;