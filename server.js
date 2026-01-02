// Production-ready MentoraX Server
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const scholarshipRoutes = require('./routes/scholarships');
const mentorRoutes = require('./routes/mentors');
const fieldRoutes = require('./routes/fields');
const eventRoutes = require('./routes/events');
const applicationRoutes = require('./routes/applications');
const notionRoutes = require('./routes/notion');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notion', notionRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/main.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/admin.html'));
});

// Catch-all route for frontend pages - must be after API routes
app.get('*', (req, res) => {
    // Don't interfere with API routes (they're handled before this)
    const fs = require('fs');
    const requestedPage = req.path.substring(1) || 'main';
    
    // Try both with and without .html extension
    const htmlPath = path.join(__dirname, `../frontend/pages/${requestedPage}.html`);
    const htmlPathWithExt = path.join(__dirname, `../frontend/pages/${requestedPage}`);
    
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else if (fs.existsSync(htmlPathWithExt) && requestedPage.includes('.html')) {
        res.sendFile(htmlPathWithExt);
    } else {
        // If page doesn't exist, serve main.html
        res.sendFile(path.join(__dirname, '../frontend/pages/main.html'));
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
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

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 MentoraX Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Admin Panel: http://localhost:${PORT}/admin
🌐 Website: http://localhost:${PORT}/

API Endpoints:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET    /api/scholarships        - Get scholarships
GET    /api/mentors             - Get mentors  
GET    /api/fields              - Get fields
POST   /api/auth/register       - User registration
POST   /api/auth/login          - User login
    `);
});

module.exports = app;