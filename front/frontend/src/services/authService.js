import api from '../config/api.js';

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Registra un nuevo usuario
   */
  async register(name, email, password) {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  /**
   * Inicia sesión
   */
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    // Guardar token y usuario
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Cierra sesión
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};


