import api from '../config/api.js';

/**
 * Servicio de notificaciones
 */
export const notificationService = {
  /**
   * Obtiene todas las notificaciones
   */
  async getAll(unreadOnly = false) {
    const url = unreadOnly ? '/notifications?unread=true' : '/notifications';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Marca una notificación como leída
   */
  async markAsRead(id) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};


