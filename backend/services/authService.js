import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

/**
 * Servicio de autenticación
 */
export class AuthService {
  /**
   * Registra un nuevo usuario
   */
  static async register(name, email, password) {
    // Verificar si el email ya existe
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const [user] = await db('users')
      .insert({
        name,
        email,
        password: hashedPassword,
      })
      .returning(['id', 'name', 'email', 'created_at']);

    return user;
  }

  /**
   * Autentica un usuario y genera JWT
   */
  static async login(email, password) {
    const user = await db('users').where({ email }).first();

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar bloqueo temporal
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(user.locked_until) - new Date()) / 60000
      );
      throw new Error(`Cuenta bloqueada. Intenta de nuevo en ${minutesLeft} minutos`);
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      // Incrementar intentos fallidos
      const attempts = (user.login_attempts || 0) + 1;
      let lockedUntil = null;

      // Bloquear después de 5 intentos fallidos por 30 minutos
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await db('users')
        .where({ id: user.id })
        .update({
          login_attempts: attempts,
          locked_until: lockedUntil,
        });

      throw new Error('Credenciales inválidas');
    }

    // Resetear intentos fallidos
    await db('users')
      .where({ id: user.id })
      .update({
        login_attempts: 0,
        locked_until: null,
      });

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}



