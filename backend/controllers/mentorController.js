import Mentor from '../models/Mentor.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all mentors with filtering
 * @route GET /api/mentors
 */
export const getMentors = asyncHandler(async (req, res) => {
  const { field, status, expertise, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (status) query.status = status;
  if (field) query.field = { $regex: field, $options: 'i' };
  if (expertise) query.expertise = { $in: [new RegExp(expertise, 'i')] };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [mentors, total] = await Promise.all([
    Mentor.find(query)
      .sort({ rating: -1, mentees: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Mentor.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: mentors,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get mentor by ID
 * @route GET /api/mentors/:id
 */
export const getMentorById = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);

  if (!mentor) {
    return res.status(404).json({
      success: false,
      error: 'Mentor not found',
    });
  }

  res.json({
    success: true,
    data: mentor,
  });
});

/**
 * Create mentor
 * @route POST /api/mentors
 */
export const createMentor = asyncHandler(async (req, res) => {
  const mentorData = { ...req.body };
  if (req.user) mentorData.createdBy = req.user.id;

  const mentor = await Mentor.create(mentorData);

  res.status(201).json({
    success: true,
    message: 'Mentor created successfully',
    data: mentor,
  });
});

/**
 * Update mentor
 * @route PUT /api/mentors/:id
 */
export const updateMentor = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!mentor) {
    return res.status(404).json({ success: false, error: 'Mentor not found' });
  }

  res.json({
    success: true,
    message: 'Mentor updated successfully',
    data: mentor,
  });
});

/**
 * Delete mentor
 * @route DELETE /api/mentors/:id
 */
export const deleteMentor = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findByIdAndDelete(req.params.id);

  if (!mentor) {
    return res.status(404).json({ success: false, error: 'Mentor not found' });
  }

  res.json({
    success: true,
    message: 'Mentor deleted successfully',
  });
});

export default {
  getMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
};
