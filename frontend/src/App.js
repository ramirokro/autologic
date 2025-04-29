import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Componentes principales
import Navbar from './components/Navbar';

// Páginas
import HomePage from './pages/HomePage';
import VehicleConnectPage from './pages/VehicleConnectPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/connect" element={<VehicleConnectPage />} />
            <Route path="/history" element={<div className="placeholder-page"><h2>Historial de diagnósticos</h2><p>Esta sección está en desarrollo.</p></div>} />
            <Route path="/guide" element={<div className="placeholder-page"><h2>Guía de códigos OBD-II</h2><p>Esta sección está en desarrollo.</p></div>} />
            <Route path="*" element={<div className="error-page"><h2>Página no encontrada</h2><p>La página que buscas no existe.</p></div>} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© 2025 Autologic - Diagnóstico automotriz inteligente</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;