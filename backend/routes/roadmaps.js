import express from 'express';
import { getRoadmaps, getRoadmapById } from '../controllers/roadmapController.js';
import { validateId } from '../utils/validation.js';

const router = express.Router();

router.get('/', getRoadmaps);
router.get('/:id', validateId, getRoadmapById);

export default router;
