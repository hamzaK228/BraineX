import Project from '../models/Project.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all projects with filtering
 * @route GET /api/projects
 */
export const getProjects = asyncHandler(async (req, res) => {
  const { field, status, category, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (field) query.field = { $regex: field, $options: 'i' };
  if (status) query.status = status;
  if (category) query.category = { $regex: category, $options: 'i' };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [projects, total] = await Promise.all([
    Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Project.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: projects,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get project by ID
 * @route GET /api/projects/:id
 */
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  res.json({ success: true, data: project });
});

/**
 * Create project
 * @route POST /api/projects
 */
export const createProject = asyncHandler(async (req, res) => {
  const projectData = { ...req.body };
  if (req.user) projectData.author = req.user.id;

  const project = await Project.create(projectData);

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

/**
 * Update project
 * @route PUT /api/projects/:id
 */
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
});

/**
 * Delete project
 * @route DELETE /api/projects/:id
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
});

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
