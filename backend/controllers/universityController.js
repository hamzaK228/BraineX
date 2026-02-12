import University from '../models/University.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all universities with filtering
 * @route GET /api/universities
 */
export const getUniversities = asyncHandler(async (req, res) => {
  const { country, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (country) query.country = { $regex: country, $options: 'i' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [universities, total] = await Promise.all([
    University.find(query)
      .sort({ ranking: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    University.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: universities,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get university by ID
 * @route GET /api/universities/:id
 */
export const getUniversityById = asyncHandler(async (req, res) => {
  const university = await University.findById(req.params.id);

  if (!university) {
    return res.status(404).json({ success: false, error: 'University not found' });
  }

  res.json({ success: true, data: university });
});

/**
 * Create university
 * @route POST /api/universities
 */
export const createUniversity = asyncHandler(async (req, res) => {
  const university = await University.create(req.body);

  res.status(201).json({
    success: true,
    message: 'University created successfully',
    data: university,
  });
});

/**
 * Update university
 * @route PUT /api/universities/:id
 */
export const updateUniversity = asyncHandler(async (req, res) => {
  const university = await University.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!university) {
    return res.status(404).json({ success: false, error: 'University not found' });
  }

  res.json({
    success: true,
    message: 'University updated successfully',
    data: university,
  });
});

/**
 * Delete university
 * @route DELETE /api/universities/:id
 */
export const deleteUniversity = asyncHandler(async (req, res) => {
  const university = await University.findByIdAndDelete(req.params.id);

  if (!university) {
    return res.status(404).json({ success: false, error: 'University not found' });
  }

  res.json({
    success: true,
    message: 'University deleted successfully',
  });
});

export default {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
};
