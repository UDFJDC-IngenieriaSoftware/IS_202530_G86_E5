import api from '../config/api.js';

/**
 * Servicio de estadísticas
 */
export const statsService = {
  /**
   * Obtiene resumen por período
   */
  async getSummary(period = 'month', params = {}) {
    const response = await api.get('/stats/summary', {
      params: { period, ...params },
    });
    return response.data;
  },

  /**
   * Obtiene totales acumulados
   */
  async getTotals(params = {}) {
    const response = await api.get('/stats/totals', { params });
    return response.data;
  },

  /**
   * Obtiene estadísticas por categoría
   */
  async getByCategory(period = 'month', params = {}) {
    const response = await api.get('/stats/by-category', {
      params: { period, ...params },
    });
    return response.data;
  },
};


