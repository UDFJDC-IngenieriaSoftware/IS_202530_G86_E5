import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { NotificationController } from '../controllers/notificationController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', NotificationController.getAll);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/read-all', NotificationController.markAllAsRead);

export default router;



