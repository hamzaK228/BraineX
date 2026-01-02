const express = require('express');
const router = express.Router();
const mentorService = require('../services/mentorService');

// Get all mentors (public route)
router.get('/', (req, res) => {
    const { field, experience, search } = req.query;
    const result = mentorService.getMentors({ field, experience, search });
    res.json(result);
});

// Get mentor by ID
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const result = mentorService.getMentorById(id);
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});

module.exports = router;