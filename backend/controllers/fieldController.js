import Field from '../models/Field.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all fields
 * @route GET /api/fields
 */
export const getFields = asyncHandler(async (req, res) => {
  const { category, search } = req.query;

  const query = {};
  if (category) query.category = { $regex: category, $options: 'i' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const fields = await Field.find(query).sort({ name: 1 });

  res.json({
    success: true,
    data: fields,
    total: fields.length,
  });
});

/**
 * Get field by ID
 * @route GET /api/fields/:id
 */
export const getFieldById = asyncHandler(async (req, res) => {
  const field = await Field.findById(req.params.id);

  if (!field) {
    return res.status(404).json({ success: false, error: 'Field not found' });
  }

  res.json({ success: true, data: field });
});

/**
 * Create field
 * @route POST /api/fields
 */
export const createField = asyncHandler(async (req, res) => {
  const field = await Field.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Field created successfully',
    data: field,
  });
});

/**
 * Update field
 * @route PUT /api/fields/:id
 */
export const updateField = asyncHandler(async (req, res) => {
  const field = await Field.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!field) {
    return res.status(404).json({ success: false, error: 'Field not found' });
  }

  res.json({
    success: true,
    message: 'Field updated successfully',
    data: field,
  });
});

/**
 * Delete field
 * @route DELETE /api/fields/:id
 */
export const deleteField = asyncHandler(async (req, res) => {
  const field = await Field.findByIdAndDelete(req.params.id);

  if (!field) {
    return res.status(404).json({ success: false, error: 'Field not found' });
  }

  res.json({
    success: true,
    message: 'Field deleted successfully',
  });
});

export default {
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
};
