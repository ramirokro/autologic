import React, { useState, useEffect } from 'react';
import './SmartcarConfigStatus.css';

const SmartcarConfigStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/smartcar/status');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err.message);
        console.error('Error verificando status de SmartCar:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="smartcar-status loading">
        <div className="status-spinner"></div>
        <p>Verificando configuración de SmartCar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="smartcar-status error">
        <h3>Error de conexión</h3>
        <p>No se pudo verificar la configuración de SmartCar: {error}</p>
        <p>Por favor, inténtelo de nuevo más tarde o contacte al administrador.</p>
      </div>
    );
  }

  if (!status || !status.configured) {
    return (
      <div className="smartcar-status not-configured">
        <h3>SmartCar no configurado</h3>
        <p>La integración con SmartCar no está configurada correctamente en este momento.</p>
        <div className="missing-config">
          <h4>Configuración faltante:</h4>
          <ul>
            {status && status.missing && status.missing.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
            {!status || !status.missing && (
              <>
                <li>SMARTCAR_CLIENT_ID</li>
                <li>SMARTCAR_CLIENT_SECRET</li>
                <li>SMARTCAR_REDIRECT_URI</li>
              </>
            )}
          </ul>
        </div>
        <p className="admin-note">
          Nota para administradores: Configure las variables de entorno en el servidor para habilitar esta funcionalidad.
        </p>
      </div>
    );
  }

  return (
    <div className="smartcar-status configured">
      <h3>SmartCar configurado correctamente</h3>
      <p>La integración con SmartCar está configurada y lista para usar.</p>
      <p>URI de redirección: <code>{status.redirect_uri || 'No disponible'}</code></p>
    </div>
  );
};

export default SmartcarConfigStatus;