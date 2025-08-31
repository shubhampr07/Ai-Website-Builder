/**
 * Main routes index file
 */
import { Router } from 'express';
import generatorRoutes from './generator.js';
import componentRoutes from './components.js';
import deploymentRoutes from './deployment.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount route modules
router.use('/api', generatorRoutes);
router.use('/api', componentRoutes);
router.use('/api', deploymentRoutes);

export default router;