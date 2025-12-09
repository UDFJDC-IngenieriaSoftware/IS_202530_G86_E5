import { StatsService } from '../services/statsService.js';

/**
 * Controlador de estadísticas
 */
export class StatsController {
  /**
   * Obtiene resumen de transacciones por período
   */
  static async getSummary(req, res, next) {
    try {
      const { period = 'month', owner_type, owner_id } = req.query;
      const data = await StatsService.getSummary(req.user.id, period, { owner_type, owner_id });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene totales acumulados
   */
  static async getTotals(req, res, next) {
    try {
      const { owner_type, owner_id } = req.query;
      const data = await StatsService.getTotals(req.user.id, { owner_type, owner_id });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene estadísticas por categoría
   */
  static async getByCategory(req, res, next) {
    try {
      const { period = 'month', owner_type, owner_id } = req.query;
      const data = await StatsService.getByCategory(req.user.id, period, { owner_type, owner_id });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}


