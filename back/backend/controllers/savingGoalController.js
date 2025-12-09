import SavingGoalService from '../services/savingGoalService.js';

/**
 * Controlador de metas de ahorro
 */
export class SavingGoalController {
  /**
   * Obtiene todas las metas del usuario
   */
  static async getAll(req, res, next) {
    try {
      const goals = await SavingGoalService.getAll(req.user.id);
      res.json(goals);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una meta por ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const goal = await SavingGoalService.getById(id, req.user.id);
      
      if (!goal) {
        return res.status(404).json({ error: 'Meta no encontrada' });
      }

      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva meta
   */
  static async create(req, res, next) {
    try {
      const { name, target_amount, type, group_id, description } = req.body;
      
      const goal = await SavingGoalService.create(req.user.id, {
        name,
        target_amount,
        type,
        group_id,
        description,
      });

      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una meta
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, target_amount, description } = req.body;

      const goal = await SavingGoalService.update(id, req.user.id, {
        name,
        target_amount,
        description,
      });

      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una meta
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await SavingGoalService.delete(id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Agrega una transacción a la meta
   */
  static async addTransaction(req, res, next) {
    try {
      const { id } = req.params;
      const { amount, description, date } = req.body;

      const transaction = await SavingGoalService.addTransaction(id, req.user.id, {
        amount,
        description,
        date,
      });

      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene transacciones de una meta
   */
  static async getTransactions(req, res, next) {
    try {
      const { id } = req.params;
      const transactions = await SavingGoalService.getTransactions(id, req.user.id);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una transacción
   */
  static async deleteTransaction(req, res, next) {
    try {
      const { transactionId } = req.params;
      const result = await SavingGoalService.deleteTransaction(transactionId, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default SavingGoalController;