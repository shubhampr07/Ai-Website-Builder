/**
 * Generator routes for landing page generation
 */
import { Router } from 'express';
import { generateLandingPage } from '../controllers/generatorController.js';

const router = Router();

// POST /api/generate - Generate landing page from prompt
router.post('/generate', generateLandingPage);

export default router;