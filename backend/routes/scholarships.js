const express = require('express');
const router = express.Router();
const scholarshipService = require('../services/scholarshipService');

// Get all scholarships (public route)
router.get('/', (req, res) => {
    const { category, field, country, search } = req.query;
    const result = scholarshipService.getScholarships({ category, field, country, search });
    res.json(result);
});

// Get scholarship by ID
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const result = scholarshipService.getScholarshipById(id);
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});

module.exports = router;