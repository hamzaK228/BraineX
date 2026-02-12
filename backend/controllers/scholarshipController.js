import Scholarship from '../models/Scholarship.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all scholarships with filtering and pagination
 * @route GET /api/scholarships
 */
export const getScholarships = asyncHandler(async (req, res) => {
  const { category, country, status, field, level, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (status) query.status = status;
  if (category) query.category = { $regex: category, $options: 'i' };
  if (country) query.country = { $regex: country, $options: 'i' };
  if (field) query.field = { $regex: field, $options: 'i' };
  if (level) query.level = level;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [scholarships, total] = await Promise.all([
    Scholarship.find(query)
      .sort({ featured: -1, deadline: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Scholarship.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: scholarships,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get scholarship by ID
 * @route GET /api/scholarships/:id
 */
export const getScholarshipById = asyncHandler(async (req, res) => {
  const scholarship = await Scholarship.findById(req.params.id);

  if (!scholarship) {
    return res.status(404).json({
      success: false,
      error: 'Scholarship not found',
    });
  }

  // Increment view count
  scholarship.viewCount = (scholarship.viewCount || 0) + 1;
  await scholarship.save();

  res.json({
    success: true,
    data: scholarship,
  });
});

/**
 * Create new scholarship
 * @route POST /api/scholarships
 */
export const createScholarship = asyncHandler(async (req, res) => {
  const scholarshipData = { ...req.body };
  if (req.user) {
    scholarshipData.createdBy = req.user.id;
  }

  const scholarship = await Scholarship.create(scholarshipData);

  res.status(201).json({
    success: true,
    message: 'Scholarship created successfully',
    data: scholarship,
  });
});

/**
 * Update scholarship
 * @route PUT /api/scholarships/:id
 */
export const updateScholarship = asyncHandler(async (req, res) => {
  const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!scholarship) {
    return res.status(404).json({
      success: false,
      error: 'Scholarship not found',
    });
  }

  res.json({
    success: true,
    message: 'Scholarship updated successfully',
    data: scholarship,
  });
});

/**
 * Delete scholarship
 * @route DELETE /api/scholarships/:id
 */
export const deleteScholarship = asyncHandler(async (req, res) => {
  const scholarship = await Scholarship.findByIdAndDelete(req.params.id);

  if (!scholarship) {
    return res.status(404).json({
      success: false,
      error: 'Scholarship not found',
    });
  }

  res.json({
    success: true,
    message: 'Scholarship deleted successfully',
  });
});

export default {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
};
