// MentoraX Admin Server
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(express.static('.', { maxAge: '7d', etag: true }));

// Serve main.html as homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Serve admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// In-memory database (replace with real database in production)
let database = {
    scholarships: [],
    mentors: [],
    fields: [],
    events: [],
    users: [],
    goals: [],
    applications: []
};

// Load initial data
function loadInitialData() {
    try {
        // Load sample data
        database.scholarships = [
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

        database.mentors = [
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

        database.fields = [
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

        console.log('✅ Initial data loaded');
    } catch (error) {
        console.error('❌ Error loading initial data:', error);
    }
}

// Authentication middleware
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

// Public API Routes (no authentication needed)

// Get all scholarships
app.get('/api/scholarships', (req, res) => {
    const { category, field, country, search } = req.query;
    let scholarships = database.scholarships.filter(s => s.status === 'active');
    
    // Apply filters
    if (category && category !== 'all') {
        scholarships = scholarships.filter(s => s.category === category);
    }
    
    if (field && field !== 'all') {
        scholarships = scholarships.filter(s => 
            s.field.toLowerCase().includes(field.toLowerCase())
        );
    }
    
    if (country && country !== 'all') {
        scholarships = scholarships.filter(s => s.country.toLowerCase() === country.toLowerCase());
    }
    
    if (search) {
        scholarships = scholarships.filter(s => 
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.organization.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json({
        success: true,
        data: scholarships,
        total: scholarships.length
    });
});

// Get all mentors
app.get('/api/mentors', (req, res) => {
    const { field, experience, search } = req.query;
    let mentors = database.mentors.filter(m => m.status === 'verified');
    
    // Apply filters
    if (field && field !== 'all') {
        mentors = mentors.filter(m => m.field === field);
    }
    
    if (experience && experience !== 'all') {
        mentors = mentors.filter(m => m.experience === experience);
    }
    
    if (search) {
        mentors = mentors.filter(m => 
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.title.toLowerCase().includes(search.toLowerCase()) ||
            m.company.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json({
        success: true,
        data: mentors,
        total: mentors.length
    });
});

// Get all fields
app.get('/api/fields', (req, res) => {
    const { category, search } = req.query;
    let fields = database.fields;
    
    // Apply filters
    if (category && category !== 'all') {
        fields = fields.filter(f => f.category === category);
    }
    
    if (search) {
        fields = fields.filter(f => 
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            f.description.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json({
        success: true,
        data: fields,
        total: fields.length
    });
});

// User registration
app.post('/api/register', (req, res) => {
    try {
        const { firstName, lastName, email, password, field } = req.body;
        
        // Check if user exists
        const existingUser = database.users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }
        
        // Create new user
        const user = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            field,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        database.users.push(user);
        
        res.json({
            success: true,
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                field: user.field
            },
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// User login
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user (in production, verify password hash)
        const user = database.users.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                field: user.field
            },
            token: 'user-token-demo', // Use JWT in production
            message: 'Login successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Admin API Routes (require authentication)

// Admin dashboard stats
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        data: {
            totalUsers: database.users.length,
            totalScholarships: database.scholarships.length,
            totalMentors: database.mentors.length,
            totalApplications: database.applications.length,
            monthlyRevenue: 45250,
            activeScholarships: database.scholarships.filter(s => s.status === 'active').length,
            verifiedMentors: database.mentors.filter(m => m.status === 'verified').length
        }
    });
});

// Create scholarship
app.post('/api/admin/scholarships', authenticateAdmin, (req, res) => {
    try {
        const scholarship = {
            id: Date.now(),
            ...req.body,
            status: req.body.status || 'active',
            createdAt: new Date().toISOString()
        };
        
        database.scholarships.push(scholarship);
        
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
app.put('/api/admin/scholarships/:id', authenticateAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = database.scholarships.findIndex(s => s.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Scholarship not found'
            });
        }
        
        database.scholarships[index] = {
            ...database.scholarships[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: database.scholarships[index],
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
app.delete('/api/admin/scholarships/:id', authenticateAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = database.scholarships.findIndex(s => s.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Scholarship not found'
            });
        }
        
        database.scholarships.splice(index, 1);
        
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
app.post('/api/admin/mentors', authenticateAdmin, (req, res) => {
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
        
        database.mentors.push(mentor);
        
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
app.post('/api/admin/fields', authenticateAdmin, (req, res) => {
    try {
        const field = {
            id: Date.now(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        database.fields.push(field);
        
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

// Get all data for admin
app.get('/api/admin/scholarships', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        data: database.scholarships
    });
});

app.get('/api/admin/mentors', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        data: database.mentors
    });
});

app.get('/api/admin/fields', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        data: database.fields
    });
});

app.get('/api/admin/users', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        data: database.users
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

app.get('/api/current-user', (req, res) => {
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
        const user = database.users[database.users.length - 1]; // Get latest user
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

// Get all applications (for admin)
app.get('/api/admin/applications', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        data: database.applications,
        total: database.applications.length
    });
});

// Submit scholarship application
app.post('/api/applications', (req, res) => {
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
        
        // Find scholarship
        const scholarship = database.scholarships.find(s => s.id === parseInt(scholarshipId));
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
        
        database.applications.push(application);
        
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

// User logout
app.post('/api/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Update application status (admin only)
app.put('/api/admin/applications/:id', authenticateAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, notes } = req.body;
        
        const index = database.applications.findIndex(a => a.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        database.applications[index] = {
            ...database.applications[index],
            status: status || database.applications[index].status,
            notes: notes || database.applications[index].notes,
            updatedAt: new Date().toISOString(),
            reviewedBy: 'Admin',
            reviewedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: database.applications[index],
            message: 'Application updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update application'
        });
    }
});

// Get user's applications
app.get('/api/my-applications', (req, res) => {
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
            data: database.applications,
            total: database.applications.length
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
});

// Notion API proxy with simple caching
const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const NOTION_VERSION = '2022-06-28';

// in-memory cache { key: { data, expiresAt } }
const notionCache = new Map();
const setCache = (key, data, ttlMs = 60 * 1000) => {
    notionCache.set(key, { data, expiresAt: Date.now() + ttlMs });
};
const getCache = (key) => {
    const entry = notionCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { notionCache.delete(key); return null; }
    return entry.data;
};

app.get('/api/notion/status', async (req, res) => {
    if (!NOTION_TOKEN) {
        return res.json({ configured: false, message: 'NOTION_TOKEN not set on server' });
    }
    try {
        const resp = await fetch('https://api.notion.com/v1/users/me', {
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': NOTION_VERSION,
                'Content-Type': 'application/json'
            }
        });
        const data = await resp.json();
        res.json({ configured: true, ok: resp.ok, data });
    } catch (e) {
        res.status(500).json({ configured: false, error: 'Failed to reach Notion', details: String(e) });
    }
});

app.post('/api/notion/search', async (req, res) => {
    if (!NOTION_TOKEN) return res.status(501).json({ error: 'Notion not configured' });
    const body = req.body || {};
    const key = `search:${JSON.stringify(body)}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);
    try {
        const resp = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': NOTION_VERSION,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await resp.json();
        const result = { ok: resp.ok, status: resp.status, data };
        setCache(key, result, 60 * 1000);
        res.status(resp.status).json(result);
    } catch (e) {
        res.status(500).json({ ok: false, error: 'Search failed', details: String(e) });
    }
});

app.get('/api/notion/pages/:id', async (req, res) => {
    if (!NOTION_TOKEN) return res.status(501).json({ error: 'Notion not configured' });
    const { id } = req.params;
    const key = `page:${id}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);
    try {
        const resp = await fetch(`https://api.notion.com/v1/pages/${id}`, {
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': NOTION_VERSION
            }
        });
        const data = await resp.json();
        const result = { ok: resp.ok, status: resp.status, data };
        setCache(key, result, 5 * 60 * 1000);
        res.status(resp.status).json(result);
    } catch (e) {
        res.status(500).json({ ok: false, error: 'Page fetch failed', details: String(e) });
    }
});

app.get('/api/notion/blocks/:id/children', async (req, res) => {
    if (!NOTION_TOKEN) return res.status(501).json({ error: 'Notion not configured' });
    const { id } = req.params;
    const key = `blocks:${id}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);
    try {
        const resp = await fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=100`, {
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': NOTION_VERSION
            }
        });
        const data = await resp.json();
        const result = { ok: resp.ok, status: resp.status, data };
        setCache(key, result, 60 * 1000);
        res.status(resp.status).json(result);
    } catch (e) {
        res.status(500).json({ ok: false, error: 'Blocks fetch failed', details: String(e) });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 MentoraX Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Admin Panel: http://localhost:${PORT}/admin.html
🌐 Website: http://localhost:${PORT}/main.html

API Endpoints:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET    /api/scholarships        - Get scholarships
GET    /api/mentors            - Get mentors  
GET    /api/fields             - Get fields
POST   /api/register           - User registration
POST   /api/login              - User login

Admin API (requires Bearer token: admin-token-demo):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET    /api/admin/stats        - Dashboard stats
POST   /api/admin/scholarships - Create scholarship
PUT    /api/admin/scholarships/:id - Update scholarship
DELETE /api/admin/scholarships/:id - Delete scholarship
POST   /api/admin/mentors      - Create mentor
POST   /api/admin/fields       - Create field

🔑 Admin Token: admin-token-demo
`);
    
    loadInitialData();
});

module.exports = app;