import api from '../config/api.js';

/**
 * Servicio de estadísticas
 */
export const statsService = {
  /**
   * Obtiene resumen por período
   */
  async getSummary(period = 'month') {
    const response = await api.get(`/stats/summary?period=${period}`);
    return response.data;
  },

  /**
   * Obtiene totales acumulados
   */
  async getTotals() {
    const response = await api.get('/stats/totals');
    return response.data;
  },

  /**
   * Obtiene estadísticas por categoría
   */
  async getByCategory(period = 'month') {
    const response = await api.get(`/stats/by-category?period=${period}`);
    return response.data;
  },
};



