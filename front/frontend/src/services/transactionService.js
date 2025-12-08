import api from '../config/api.js';

/**
 * Servicio de transacciones
 */
export const transactionService = {
  /**
   * Obtiene todas las transacciones
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('category_id', filters.categoryId);

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtiene una transacción por ID
   */
  async getById(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva transacción
   */
  async create(data) {

    if(!data.owner_type || !data.owner_id){
      throw new Error("Debe especificar owner_type y owner_id al crear una transacción");
    }

    const response = await api.post('/transactions', data);
    return response.data;
  },

  /**
   * Actualiza una transacción
   */
  async update(id, data) {
    if(!data.owner_type || !data.owner_id){
      throw new Error("Debe especificar owner_type y owner_id al actualizar una transacción");
    }

    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  /**
   * Elimina una transacción
   */
  async delete(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};


