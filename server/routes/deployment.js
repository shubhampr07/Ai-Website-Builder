/**
 * Deployment routes for Netlify deployments
 */
import { Router } from 'express';
import { deployToNetlify } from '../controllers/deploymentController.js';

const router = Router();

// POST /api/deploy - Deploy HTML to Netlify
router.post('/deploy', deployToNetlify);

export default router;