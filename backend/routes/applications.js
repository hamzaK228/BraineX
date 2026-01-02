const express = require('express');
const router = express.Router();

// In-memory database (replace with real database in production)
let applications = [];

// Submit scholarship application
router.post('/', (req, res) => {
    try {
        const { 
            scholarshipId, 
            fullName, 
            email, 
            phone, 
            education, 
            experience, 
            essay, 
            documents 
        } = req.body;
        
        // Validate required fields
        if (!scholarshipId || !fullName || !email || !essay) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        // Find scholarship (in a real app, this would come from the scholarship service)
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
        
        const scholarship = scholarships.find(s => s.id === parseInt(scholarshipId));
        if (!scholarship) {
            return res.status(404).json({
                success: false,
                error: 'Scholarship not found'
            });
        }
        
        // Create application
        const application = {
            id: Date.now(),
            scholarshipId: parseInt(scholarshipId),
            scholarshipName: scholarship.name,
            fullName,
            email,
            phone: phone || '',
            education: education || '',
            experience: experience || '',
            essay,
            documents: documents || [],
            status: 'submitted', // submitted, reviewed, accepted, rejected
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        applications.push(application);
        
        res.json({
            success: true,
            data: application,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to submit application'
        });
    }
});

// Get user's applications
router.get('/my-applications', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    // For demo, return all applications. In production, filter by user
    if (token === 'user-token-demo' || token === 'admin-token-demo') {
        res.json({
            success: true,
            data: applications,
            total: applications.length
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
});

module.exports = router;