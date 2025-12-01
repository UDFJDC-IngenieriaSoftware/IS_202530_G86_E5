import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { StatsController } from '../controllers/statsController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/summary', StatsController.getSummary);
router.get('/totals', StatsController.getTotals);
router.get('/by-category', StatsController.getByCategory);

export default router;


