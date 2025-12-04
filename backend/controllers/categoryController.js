import { body, validationResult } from 'express-validator';
import { CategoryService } from '../services/categoryService.js';

/**
 * Controlador de categorías
 */
export class CategoryController {
  /**
   * Validaciones para crear categoría
   */
  static validateCreate() {
    return [
      body('name').trim().notEmpty().withMessage('El nombre es requerido'),
      body('type')
        .isIn(['income', 'expense'])
        .withMessage('Tipo debe ser income o expense'),
      body('color').optional().isString(),
    ];
  }

  /**
   * Validaciones para actualizar categoría
   */
  static validateUpdate() {
    return [
      body('name').optional().trim().notEmpty(),
      body('type').optional().isIn(['income', 'expense']),
      body('color').optional().isString(),
    ];
  }

  /**
   * Obtiene todas las categorías del usuario
   */
  static async getAll(req, res, next) {
    try {
      const categories = await CategoryService.getByUserId(
        req.user.id,
        req.query.type
      );
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  static async getById(req, res, next) {
    try {
      const category = await CategoryService.getById(
        req.params.id,
        req.user.id
      );
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva categoría
   */
  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const category = await CategoryService.create(req.user.id, req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una categoría
   */
  static async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const category = await CategoryService.update(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una categoría
   */
  static async delete(req, res, next) {
    try {
      await CategoryService.delete(req.params.id, req.user.id);
      res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}



