import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { TransactionController } from '../controllers/transactionController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', TransactionController.getAll);
router.get('/:id', TransactionController.getById);
router.post(
  '/',
  TransactionController.validateCreate(),
  TransactionController.create
);
router.put(
  '/:id',
  TransactionController.validateUpdate(),
  TransactionController.update
);
router.delete('/:id', TransactionController.delete);

export default router;


