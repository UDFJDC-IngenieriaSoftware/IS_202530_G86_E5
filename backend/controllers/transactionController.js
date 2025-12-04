import { body, query, validationResult } from 'express-validator';
import { TransactionService } from '../services/transactionService.js';

/**
 * Controlador de transacciones
 */
export class TransactionController {
  /**
   * Validaciones para crear transacción
   */
  static validateCreate() {
    return [
      body('category_id').isInt().withMessage('category_id debe ser un número'),
      body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('El monto debe ser mayor a 0'),
      body('date').isISO8601().withMessage('Fecha inválida'),
      body('description').optional().isString(),
      body('type')
        .optional()
        .isIn(['income', 'expense'])
        .withMessage('Tipo debe ser income o expense'),
    ];
  }

  /**
   * Validaciones para actualizar transacción
   */
  static validateUpdate() {
    return [
      body('category_id').optional().isInt(),
      body('amount').optional().isFloat({ min: 0.01 }),
      body('date').optional().isISO8601(),
      body('description').optional().isString(),
      body('type').optional().isIn(['income', 'expense']),
    ];
  }

  /**
   * Obtiene todas las transacciones del usuario
   */
  static async getAll(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        type: req.query.type,
        categoryId: req.query.category_id,
      };

      const transactions = await TransactionService.getByUserId(
        req.user.id,
        filters
      );

      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una transacción por ID
   */
  static async getById(req, res, next) {
    try {
      const transaction = await TransactionService.getById(
        req.params.id,
        req.user.id
      );
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva transacción
   */
  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const transaction = await TransactionService.create(req.user.id, req.body);

      // Emitir evento Socket.IO
      req.io.emit('transaction:created', {
        userId: req.user.id,
        transaction,
      });

      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una transacción
   */
  static async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const transaction = await TransactionService.update(
        req.params.id,
        req.user.id,
        req.body
      );

      // Emitir evento Socket.IO
      req.io.emit('transaction:updated', {
        userId: req.user.id,
        transaction,
      });

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una transacción
   */
  static async delete(req, res, next) {
    try {
      await TransactionService.delete(req.params.id, req.user.id);

      // Emitir evento Socket.IO
      req.io.emit('transaction:deleted', {
        userId: req.user.id,
        transactionId: req.params.id,
      });

      res.json({ message: 'Transacción eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}



