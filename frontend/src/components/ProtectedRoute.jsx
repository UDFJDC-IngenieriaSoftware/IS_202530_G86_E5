import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService.js';

/**
 * Componente para proteger rutas que requieren autenticación
 */
export const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};



