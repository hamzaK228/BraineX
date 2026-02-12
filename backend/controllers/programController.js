import Program from '../models/Program.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all programs with filtering
 * @route GET /api/programs
 */
export const getPrograms = asyncHandler(async (req, res) => {
  const { university, degree, field, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (university) query.university = { $regex: university, $options: 'i' };
  if (degree) query.degree = degree;
  if (field) query.field = { $regex: field, $options: 'i' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { university: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [programs, total] = await Promise.all([
    Program.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Program.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: programs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get program by ID
 * @route GET /api/programs/:id
 */
export const getProgramById = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);

  if (!program) {
    return res.status(404).json({ success: false, error: 'Program not found' });
  }

  res.json({ success: true, data: program });
});

/**
 * Create program
 * @route POST /api/programs
 */
export const createProgram = asyncHandler(async (req, res) => {
  const program = await Program.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Program created successfully',
    data: program,
  });
});

/**
 * Update program
 * @route PUT /api/programs/:id
 */
export const updateProgram = asyncHandler(async (req, res) => {
  const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!program) {
    return res.status(404).json({ success: false, error: 'Program not found' });
  }

  res.json({
    success: true,
    message: 'Program updated successfully',
    data: program,
  });
});

/**
 * Delete program
 * @route DELETE /api/programs/:id
 */
export const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findByIdAndDelete(req.params.id);

  if (!program) {
    return res.status(404).json({ success: false, error: 'Program not found' });
  }

  res.json({
    success: true,
    message: 'Program deleted successfully',
  });
});

export default {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
};
