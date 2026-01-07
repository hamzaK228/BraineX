const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');

// Get all mentors (public route)
router.get('/', mentorController.getMentors);

// Get mentor by ID
router.get('/:id', mentorController.getMentorById);

module.exports = router;