import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  // Función para determinar si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Autologic</span>
        </Link>
        
        <div className="mobile-menu-button" onClick={toggleMobileMenu}>
          <div className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <ul className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Diagnóstico
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/connect" 
              className={`nav-link ${isActive('/connect') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Conectar vehículo
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/history" 
              className={`nav-link ${isActive('/history') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Historial
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/guide" 
              className={`nav-link ${isActive('/guide') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Guía OBD-II
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;