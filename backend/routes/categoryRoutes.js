import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { CategoryController } from '../controllers/categoryController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post(
  '/',
  CategoryController.validateCreate(),
  CategoryController.create
);
router.put(
  '/:id',
  CategoryController.validateUpdate(),
  CategoryController.update
);
router.delete('/:id', CategoryController.delete);

export default router;



