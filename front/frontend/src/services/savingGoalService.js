import api from '../config/api.js';

/**
 * Servicio de metas de ahorro
 */
export const savingGoalService = {
  /**
   * Obtiene todas las metas del usuario
   */
  async getAll() {
    const response = await api.get('/saving-goals');
    return response.data;
  },

  /**
   * Obtiene una meta por ID
   */
  async getById(id) {
    const response = await api.get(`/saving-goals/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva meta
   */
  async create(data) {
    const response = await api.post('/saving-goals', data);
    return response.data;
  },

  /**
   * Actualiza una meta
   */
  async update(id, data) {
    const response = await api.put(`/saving-goals/${id}`, data);
    return response.data;
  },

  /**
   * Elimina una meta
   */
  async delete(id) {
    const response = await api.delete(`/saving-goals/${id}`);
    return response.data;
  },

  /**
   * Agrega una transacción a la meta
   */
  async addTransaction(id, data) {
    const response = await api.post(`/saving-goals/${id}/transactions`, data);
    return response.data;
  },

  /**
   * Obtiene transacciones de una meta
   */
  async getTransactions(id) {
    const response = await api.get(`/saving-goals/${id}/transactions`);
    return response.data;
  },

  /**
   * Elimina una transacción
   */
  async deleteTransaction(transactionId) {
    const response = await api.delete(`/saving-goals/transactions/${transactionId}`);
    return response.data;
  },
};

export default savingGoalService;