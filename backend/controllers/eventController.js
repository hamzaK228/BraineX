import Event from '../models/Event.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all events with filtering
 * @route GET /api/events
 */
export const getEvents = asyncHandler(async (req, res) => {
  const { type, eventType, status, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (type) query.type = { $regex: type, $options: 'i' };
  if (eventType) query.eventType = eventType;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [events, total] = await Promise.all([
    Event.find(query)
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Event.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: events,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get event by ID
 * @route GET /api/events/:id
 */
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  res.json({ success: true, data: event });
});

/**
 * Create event
 * @route POST /api/events
 */
export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: event,
  });
});

/**
 * Update event
 * @route PUT /api/events/:id
 */
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: event,
  });
});

/**
 * Delete event
 * @route DELETE /api/events/:id
 */
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
});

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
