import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/authService.js';

/**
 * Controlador de autenticación
 */
export class AuthController {
  /**
   * Validaciones para registro
   */
  static validateRegister() {
    return [
      body('name').trim().notEmpty().withMessage('El nombre es requerido'),
      body('email').isEmail().withMessage('Email inválido'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    ];
  }

  /**
   * Validaciones para login
   */
  static validateLogin() {
    return [
      body('email').isEmail().withMessage('Email inválido'),
      body('password').notEmpty().withMessage('La contraseña es requerida'),
    ];
  }

  /**
   * Registro de usuario
   */
  static async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;
      const user = await AuthService.register(name, email, password);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login de usuario
   */
  static async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}


