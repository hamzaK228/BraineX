import Roadmap from '../models/Roadmap.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all roadmaps with filtering
 * @route GET /api/roadmaps
 */
export const getRoadmaps = asyncHandler(async (req, res) => {
  const { category, field, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (category) query.category = { $regex: category, $options: 'i' };
  if (field) query.field = { $regex: field, $options: 'i' };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [roadmaps, total] = await Promise.all([
    Roadmap.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Roadmap.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: roadmaps,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get roadmap by ID
 * @route GET /api/roadmaps/:id
 */
export const getRoadmapById = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findById(req.params.id);

  if (!roadmap) {
    return res.status(404).json({ success: false, error: 'Roadmap not found' });
  }

  res.json({ success: true, data: roadmap });
});

/**
 * Create roadmap
 * @route POST /api/roadmaps
 */
export const createRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Roadmap created successfully',
    data: roadmap,
  });
});

/**
 * Update roadmap
 * @route PUT /api/roadmaps/:id
 */
export const updateRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!roadmap) {
    return res.status(404).json({ success: false, error: 'Roadmap not found' });
  }

  res.json({
    success: true,
    message: 'Roadmap updated successfully',
    data: roadmap,
  });
});

/**
 * Delete roadmap
 * @route DELETE /api/roadmaps/:id
 */
export const deleteRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findByIdAndDelete(req.params.id);

  if (!roadmap) {
    return res.status(404).json({ success: false, error: 'Roadmap not found' });
  }

  res.json({
    success: true,
    message: 'Roadmap deleted successfully',
  });
});

export default {
  getRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
};
