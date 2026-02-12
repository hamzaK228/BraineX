// Admin Routes - MongoDB/Mongoose
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Scholarship from '../models/Scholarship.js';
import Mentor from '../models/Mentor.js';
import Field from '../models/Field.js';
import Event from '../models/Event.js';
import University from '../models/University.js';
import Program from '../models/Program.js';
import Project from '../models/Project.js';
import Roadmap from '../models/Roadmap.js';

const router = express.Router();

// Apply auth to all admin routes
router.use(authenticate);
router.use(authorize('super_admin', 'moderator', 'content_manager'));

// ==================== DASHBOARD STATS ====================

router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalScholarships,
      activeScholarships,
      totalMentors,
      verifiedMentors,
      totalFields,
      totalEvents,
      totalUniversities,
      totalPrograms,
      totalProjects,
      totalRoadmaps,
    ] = await Promise.all([
      User.countDocuments(),
      Scholarship.countDocuments(),
      Scholarship.countDocuments({ status: 'active' }),
      Mentor.countDocuments(),
      Mentor.countDocuments({ status: 'verified' }),
      Field.countDocuments(),
      Event.countDocuments(),
      University.countDocuments(),
      Program.countDocuments(),
      Project.countDocuments(),
      Roadmap.countDocuments(),
    ]);

    const students = await User.countDocuments({ role: 'user' });
    const admins = await User.countDocuments({ role: { $in: ['super_admin', 'moderator', 'content_manager'] } });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students,
          mentors: verifiedMentors,
          admins,
        },
        totalScholarships,
        activeScholarships,
        totalMentors,
        verifiedMentors,
        totalFields,
        totalEvents,
        totalUniversities,
        totalPrograms,
        totalProjects,
        totalRoadmaps,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// ==================== USERS ====================

router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'moderator', 'content_manager', 'super_admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user, message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user role' });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user, message: `User ${isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// ==================== SCHOLARSHIPS ====================

router.get('/scholarships', async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ createdAt: -1 });
    res.json({ success: true, data: scholarships, count: scholarships.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch scholarships' });
  }
});

router.post('/scholarships', async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    const scholarship = await Scholarship.create(data);
    res.status(201).json({ success: true, data: scholarship });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create scholarship' });
  }
});

router.put('/scholarships/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!scholarship) return res.status(404).json({ success: false, error: 'Scholarship not found' });
    res.json({ success: true, data: scholarship });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update scholarship' });
  }
});

router.delete('/scholarships/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, error: 'Scholarship not found' });
    res.json({ success: true, message: 'Scholarship deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete scholarship' });
  }
});

// ==================== MENTORS ====================

router.get('/mentors', async (req, res) => {
  try {
    const mentors = await Mentor.find().sort({ createdAt: -1 });
    res.json({ success: true, data: mentors, count: mentors.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch mentors' });
  }
});

router.post('/mentors', async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    const mentor = await Mentor.create(data);
    res.status(201).json({ success: true, data: mentor });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create mentor' });
  }
});

router.put('/mentors/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mentor) return res.status(404).json({ success: false, error: 'Mentor not found' });
    res.json({ success: true, data: mentor });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update mentor' });
  }
});

router.delete('/mentors/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndDelete(req.params.id);
    if (!mentor) return res.status(404).json({ success: false, error: 'Mentor not found' });
    res.json({ success: true, message: 'Mentor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete mentor' });
  }
});

// ==================== FIELDS ====================

router.get('/fields', async (req, res) => {
  try {
    const fields = await Field.find().sort({ name: 1 });
    res.json({ success: true, data: fields, count: fields.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch fields' });
  }
});

router.post('/fields', async (req, res) => {
  try {
    const field = await Field.create(req.body);
    res.status(201).json({ success: true, data: field });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create field' });
  }
});

router.put('/fields/:id', async (req, res) => {
  try {
    const field = await Field.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!field) return res.status(404).json({ success: false, error: 'Field not found' });
    res.json({ success: true, data: field });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update field' });
  }
});

router.delete('/fields/:id', async (req, res) => {
  try {
    const field = await Field.findByIdAndDelete(req.params.id);
    if (!field) return res.status(404).json({ success: false, error: 'Field not found' });
    res.json({ success: true, message: 'Field deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete field' });
  }
});

// ==================== EVENTS ====================

router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({ success: true, data: events, count: events.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

router.post('/events', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create event' });
  }
});

router.put('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update event' });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete event' });
  }
});

// ==================== UNIVERSITIES ====================

router.get('/universities', async (req, res) => {
  try {
    const universities = await University.find().sort({ ranking: 1 });
    res.json({ success: true, data: universities, count: universities.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch universities' });
  }
});

router.post('/universities', async (req, res) => {
  try {
    const university = await University.create(req.body);
    res.status(201).json({ success: true, data: university });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create university' });
  }
});

router.put('/universities/:id', async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!university) return res.status(404).json({ success: false, error: 'University not found' });
    res.json({ success: true, data: university });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update university' });
  }
});

router.delete('/universities/:id', async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) return res.status(404).json({ success: false, error: 'University not found' });
    res.json({ success: true, message: 'University deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete university' });
  }
});

// ==================== PROGRAMS ====================

router.get('/programs', async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.json({ success: true, data: programs, count: programs.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch programs' });
  }
});

router.post('/programs', async (req, res) => {
  try {
    const program = await Program.create(req.body);
    res.status(201).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create program' });
  }
});

router.put('/programs/:id', async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!program) return res.status(404).json({ success: false, error: 'Program not found' });
    res.json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update program' });
  }
});

router.delete('/programs/:id', async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ success: false, error: 'Program not found' });
    res.json({ success: true, message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete program' });
  }
});

// ==================== PROJECTS ====================

router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, data: projects, count: projects.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

// ==================== ROADMAPS ====================

router.get('/roadmaps', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().sort({ createdAt: -1 });
    res.json({ success: true, data: roadmaps, count: roadmaps.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch roadmaps' });
  }
});

router.post('/roadmaps', async (req, res) => {
  try {
    const roadmap = await Roadmap.create(req.body);
    res.status(201).json({ success: true, data: roadmap });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create roadmap' });
  }
});

router.put('/roadmaps/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!roadmap) return res.status(404).json({ success: false, error: 'Roadmap not found' });
    res.json({ success: true, data: roadmap });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update roadmap' });
  }
});

router.delete('/roadmaps/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
    if (!roadmap) return res.status(404).json({ success: false, error: 'Roadmap not found' });
    res.json({ success: true, message: 'Roadmap deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete roadmap' });
  }
});

export default router;
