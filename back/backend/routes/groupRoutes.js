import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { GroupController } from '../controllers/groupController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', GroupController.getAll);
router.get('/:id', GroupController.getById);
router.post(
  '/',
  GroupController.validateCreate(),
  GroupController.create
);
router.post(
  '/:id/invite',
  [body('email').isEmail().withMessage('Email inválido')],
  GroupController.invite
);
router.post(
  '/invitations/:invitationId/respond',
  [body('accept').isBoolean().withMessage('accept debe ser true o false')],
  GroupController.respondToInvitation
);
router.post(
  '/:id/modifications',
  [
    body('modification_type')
      .isIn(['target_amount', 'name', 'description'])
      .withMessage('Tipo de modificación inválido'),
    body('new_value').notEmpty().withMessage('new_value es requerido'),
  ],
  GroupController.proposeModification
);
router.post(
  '/modifications/:modificationId/respond',
  [body('approve').isBoolean().withMessage('approve debe ser true o false')],
  GroupController.respondToModification
);

export default router;


