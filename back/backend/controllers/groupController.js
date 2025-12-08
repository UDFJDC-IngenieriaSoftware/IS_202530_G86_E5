import { body, validationResult } from 'express-validator';
import { GroupService } from '../services/groupService.js';

/**
 * Controlador de grupos
 */
export class GroupController {
  /**
   * Validaciones para crear grupo
   */
  static validateCreate() {
    return [
      body('name').trim().notEmpty().withMessage('El nombre es requerido'),
      body('description').optional().isString(),
      body('target_amount').optional().isFloat({ min: 0 }),
    ];
  }

  /**
   * Obtiene todos los grupos del usuario
   */
  static async getAll(req, res, next) {
    try {
      const groups = await GroupService.getByUserId(req.user.id);
      res.json(groups);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene un grupo por ID
   */
  static async getById(req, res, next) {
    try {
      const group = await GroupService.getById(req.params.id, req.user.id);
      res.json(group);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea un nuevo grupo
   */
  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const group = await GroupService.create(req.user.id, req.body);
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Invita un usuario a un grupo
   */
  static async invite(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const invitation = await GroupService.invite(
        req.params.id,
        req.user.id,
        req.body.email
      );

      // Emitir evento Socket.IO
      req.io.emit('group:invitation', {
        groupId: req.params.id,
        invitation,
      });

      res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Responde a una invitación
   */
  static async respondToInvitation(req, res, next) {
    try {
      const { accept } = req.body;
      const result = await GroupService.respondToInvitation(
        req.params.invitationId,
        req.user.id,
        accept
      );

      // Emitir evento Socket.IO
      req.io.emit('group:invitation_response', {
        invitationId: req.params.invitationId,
        userId: req.user.id,
        accept,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Propone una modificación
   */
  static async proposeModification(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const modification = await GroupService.proposeModification(
        req.params.id,
        req.user.id,
        req.body.modification_type,
        req.body.new_value
      );

      // Emitir evento Socket.IO
      req.io.emit('group:modification_proposed', {
        groupId: req.params.id,
        modification,
      });

      res.status(201).json(modification);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Responde a una modificación
   */
  static async respondToModification(req, res, next) {
    try {
      const { approve } = req.body;
      const result = await GroupService.respondToModification(
        req.params.modificationId,
        req.user.id,
        approve
      );

      // Emitir evento Socket.IO
      req.io.emit('group:modification_response', {
        modificationId: req.params.modificationId,
        userId: req.user.id,
        approve,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}


