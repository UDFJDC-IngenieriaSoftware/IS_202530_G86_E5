import express from 'express';
import SavingGoalController from '../controllers/savingGoalController.js';
import { authenticate } from '../middleware/auth.js'; // Cambia esto

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate); // Cambia esto también

// CRUD de metas
router.get('/', SavingGoalController.getAll);
router.get('/:id', SavingGoalController.getById);
router.post('/', SavingGoalController.create);
router.put('/:id', SavingGoalController.update);
router.delete('/:id', SavingGoalController.delete);

// Transacciones de metas
router.post('/:id/transactions', SavingGoalController.addTransaction);
router.get('/:id/transactions', SavingGoalController.getTransactions);
router.delete('/transactions/:transactionId', SavingGoalController.deleteTransaction);

export default router;