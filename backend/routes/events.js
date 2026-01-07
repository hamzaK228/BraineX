const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, deleteEvent } = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth'); // Changed protect to authenticate

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authenticate, authorize('admin'), createEvent); // Changed protect to authenticate
router.delete('/:id', authenticate, authorize('admin'), deleteEvent); // Changed protect to authenticate

module.exports = router;