import api from '../config/api.js';

/**
 * Servicio de categorías
 */
export const categoryService = {
  /**
   * Obtiene todas las categorías
   */
  async getAll(type = null) {
    const url = type ? `/categories?type=${type}` : '/categories';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Obtiene una categoría por ID
   */
  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva categoría
   */
  async create(data) {
    const response = await api.post('/categories', data);
    return response.data;
  },

  /**
   * Actualiza una categoría
   */
  async update(id, data) {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * Elimina una categoría
   */
  async delete(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};



