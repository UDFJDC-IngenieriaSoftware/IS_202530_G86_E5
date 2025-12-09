import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import './Layout.css';

/**
 * Layout principal con navegación
 */
export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/dashboard">PHOB HUB</Link>
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/transactions">Transacciones</Link>
          <Link to="/categories">Categorías</Link>
          <Link to="/groups">Grupos</Link>
          <Link to="/savings" className="nav-link">Metas de Ahorro</Link>
        </div>
        <div className="nav-user">
          <span>Hola, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Salir
          </button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};


