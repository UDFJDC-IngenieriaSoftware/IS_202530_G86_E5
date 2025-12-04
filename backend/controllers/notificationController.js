import { NotificationService } from '../services/notificationService.js';

/**
 * Controlador de notificaciones
 */
export class NotificationController {
  /**
   * Obtiene todas las notificaciones del usuario
   */
  static async getAll(req, res, next) {
    try {
      const unreadOnly = req.query.unread === 'true';
      const notifications = await NotificationService.getByUserId(
        req.user.id,
        unreadOnly
      );
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marca una notificación como leída
   */
  static async markAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAsRead(
        req.params.id,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  static async markAllAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllAsRead(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}



