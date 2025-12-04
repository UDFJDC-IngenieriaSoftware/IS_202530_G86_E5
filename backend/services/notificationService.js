import db from '../config/database.js';

/**
 * Servicio de notificaciones
 */
export class NotificationService {
  /**
   * Crea una nueva notificación
   */
  static async create(userId, data) {
    const [notification] = await db('notifications')
      .insert({
        user_id: userId,
        type: data.type,
        title: data.title,
        message: data.message || null,
        data: JSON.stringify(data.data || {}),
        read: false,
      })
      .returning('*');

    return notification;
  }

  /**
   * Obtiene todas las notificaciones de un usuario
   */
  static async getByUserId(userId, unreadOnly = false) {
    let query = db('notifications')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');

    if (unreadOnly) {
      query = query.where({ read: false });
    }

    const notifications = await query;
    return notifications.map((n) => ({
      ...n,
      data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data,
    }));
  }

  /**
   * Marca una notificación como leída
   */
  static async markAsRead(notificationId, userId) {
    await db('notifications')
      .where({ id: notificationId, user_id: userId })
      .update({ read: true });

    return { success: true };
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  static async markAllAsRead(userId) {
    await db('notifications')
      .where({ user_id: userId, read: false })
      .update({ read: true });

    return { success: true };
  }
}



