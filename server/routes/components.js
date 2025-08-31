/**
 * Component routes for CRUD operations
 */
import { Router } from 'express';
import { 
  createComponent, 
  getComponent, 
  updateComponent, 
  deleteComponent, 
  debugComponents 
} from '../controllers/componentController.js';

const router = Router();

// POST /api/component - Create new component
router.post('/component', createComponent);

// GET /api/preview/:id - Get component by ID
router.get('/preview/:id', getComponent);

// PUT /api/component/:id - Update component
router.put('/component/:id', updateComponent);

// DELETE /api/component/:id - Delete component
router.delete('/component/:id', deleteComponent);

// GET /api/debug/components - Debug endpoint to view all components
router.get('/debug/components', debugComponents);

export default router;