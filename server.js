// Production-ready BraineX Server
require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import database connection
const connectDB = require('./backend/config/database');

// Import routes
const authRoutes = require('./backend/routes/auth');
const scholarshipRoutes = require('./backend/routes/scholarships');
const mentorRoutes = require('./backend/routes/mentors');
const fieldRoutes = require('./backend/routes/fields');
const eventRoutes = require('./backend/routes/events');
const applicationRoutes = require('./backend/routes/applications');
const notionRoutes = require('./backend/routes/notion');
const adminRoutes = require('./backend/routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Helmet for HTTP headers
// Security: Helmet for HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"], // Removed unsafe-inline
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "http://localhost:*", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression());

// Rate Limiter for Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: 'Too many login attempts, please try again after 15 minutes'
});

// Static files
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/assets', express.static(path.join(__dirname, 'frontend/assets')));

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notion', notionRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend pages
const PAGES_DIR = path.join(__dirname, 'frontend/pages');

app.get('/', (req, res) => {
    res.sendFile(path.join(PAGES_DIR, 'main.html'));
});

// Serve any .html file from the pages directory
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page.includes('.')) return next(); // Not a clean route

    const filePath = path.join(PAGES_DIR, `${page}.html`);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.sendFile(path.join(PAGES_DIR, 'main.html'));
        }
    });
});

// Catch-all for .html requests
app.get('/*.html', (req, res) => {
    const filePath = path.join(PAGES_DIR, path.basename(req.path));
    res.sendFile(filePath, (err) => {
        if (err) {
            res.sendFile(path.join(PAGES_DIR, 'main.html'));
        }
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: messages.join(', ')
        });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB (optional - app works without it for demo)
        await connectDB();

        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🧠  BraineX LMS Server - Production Ready          ║
║                                                       ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║   🌐 Website:     http://localhost:${PORT}              ║
║   📊 Admin:       http://localhost:${PORT}/admin        ║
║   🔧 API Health:  http://localhost:${PORT}/api/health   ║
║                                                       ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(15)}                   ║
║                                                       ║
╠═══════════════════════════════════════════════════════╣
║   API Endpoints:                                      ║
║   ─────────────────────────────────────────────────   ║
║   POST  /api/auth/register    - User registration     ║
║   POST  /api/auth/login       - User login           ║
║   GET   /api/auth/me          - Get current user     ║
║   GET   /api/scholarships     - Get scholarships     ║
║   GET   /api/mentors          - Get mentors          ║
║   GET   /api/admin/stats      - Admin dashboard      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;