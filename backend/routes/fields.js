const express = require('express');
const router = express.Router();
const fieldService = require('../services/fieldService');

// Get all fields (public route)
router.get('/', (req, res) => {
    const { category, search } = req.query;
    const result = fieldService.getFields({ category, search });
    res.json(result);
});

// Get field by ID
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const result = fieldService.getFieldById(id);
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});

module.exports = router;