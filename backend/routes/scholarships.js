const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');

// Get all scholarships (public route)
router.get('/', scholarshipController.getScholarships);

// Get scholarship by ID
router.get('/:id', scholarshipController.getScholarshipById);

module.exports = router;