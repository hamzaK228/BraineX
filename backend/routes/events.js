const express = require('express');
const router = express.Router();

// Get all events (public route)
router.get('/', (req, res) => {
    // In-memory database (replace with real database in production)
    let events = [
        {
            id: 1,
            title: "AI & Machine Learning Conference",
            date: "2024-11-15",
            location: "San Francisco, CA",
            description: "Annual conference on the latest in AI and ML research",
            type: "conference",
            registrationLink: "https://example.com/register"
        },
        {
            id: 2,
            title: "Tech Career Fair",
            date: "2024-12-05",
            location: "New York, NY",
            description: "Connect with top tech companies and find your dream job",
            type: "career-fair",
            registrationLink: "https://example.com/register"
        }
    ];

    const { type, location, search } = req.query;

    // Apply filters
    if (type && type !== 'all') {
        events = events.filter(e => e.type === type);
    }

    if (location && location !== 'all') {
        events = events.filter(e => 
            e.location.toLowerCase().includes(location.toLowerCase())
        );
    }

    if (search) {
        events = events.filter(e => 
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.description.toLowerCase().includes(search.toLowerCase())
        );
    }

    res.json({
        success: true,
        data: events,
        total: events.length
    });
});

// Get event by ID
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const events = [
        {
            id: 1,
            title: "AI & Machine Learning Conference",
            date: "2024-11-15",
            location: "San Francisco, CA",
            description: "Annual conference on the latest in AI and ML research",
            type: "conference",
            registrationLink: "https://example.com/register"
        },
        {
            id: 2,
            title: "Tech Career Fair",
            date: "2024-12-05",
            location: "New York, NY",
            description: "Connect with top tech companies and find your dream job",
            type: "career-fair",
            registrationLink: "https://example.com/register"
        }
    ];
    
    const event = events.find(e => e.id === id);
    
    if (event) {
        res.json({
            success: true,
            data: event
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Event not found'
        });
    }
});

module.exports = router;