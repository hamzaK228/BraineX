import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getProjects = asyncHandler(async (req, res) => {
  const { field, difficulty, status = 'active', page = 1, limit = 20 } = req.query;

  let query = 'SELECT * FROM projects WHERE status = ?';
  const params = [status];

  if (field) {
    query += ' AND field = ?';
    params.push(field);
  }

  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }

  const offset = (page - 1) * limit;
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [projects] = await pool.query(query, params);

  res.json({
    success: true,
    data: projects,
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);

  if (projects.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Project not found',
    });
  }

  res.json({
    success: true,
    data: projects[0],
  });
});

export default { getProjects, getProjectById };
