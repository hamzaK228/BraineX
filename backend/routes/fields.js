const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');

// Get all fields (public route)
router.get('/', fieldController.getFields);

// Get field by ID
router.get('/:id', fieldController.getFieldById);

module.exports = router;