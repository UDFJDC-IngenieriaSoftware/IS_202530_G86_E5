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
      const period = req.query.period || 'month';
      const summary = await StatsService.getSummary(req.user.id, period);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene totales acumulados
   */
  static async getTotals(req, res, next) {
    try {
      const totals = await StatsService.getTotals(req.user.id);
      res.json(totals);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene estadísticas por categoría
   */
  static async getByCategory(req, res, next) {
    try {
      const period = req.query.period || 'month';
      const stats = await StatsService.getByCategory(req.user.id, period);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}



