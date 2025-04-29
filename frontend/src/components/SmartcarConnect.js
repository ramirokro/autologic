import React, { useState, useEffect } from 'react';
import SmartcarConfigStatus from './SmartcarConfigStatus';
import './SmartcarConnect.css';

const SmartcarConnect = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectedVehicles, setConnectedVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('smartcar_access_token') || ''
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('smartcar_refresh_token') || ''
  );
  
  // Verificar estado de configuración de SmartCar
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/smartcar/status');
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError('Error al verificar estado de SmartCar: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, []);
  
  // Si hay un token guardado, obtener vehículos conectados
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!accessToken) return;
      
      try {
        const response = await fetch(`/api/smartcar/vehicles?access_token=${accessToken}`);
        
        if (!response.ok) {
          if (response.status === 401 && refreshToken) {
            // Token expirado, intentar refrescar
            await refreshAccessToken();
            return;
          }
          throw new Error('Error al obtener vehículos');
        }
        
        const data = await response.json();
        setConnectedVehicles(data.vehicles || []);
      } catch (err) {
        console.error('Error al obtener vehículos:', err);
        setError('Error al obtener vehículos conectados: ' + err.message);
      }
    };
    
    fetchVehicles();
  }, [accessToken]);
  
  // Función para iniciar autorización con SmartCar
  const handleConnect = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/smartcar/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        // Redirigir al usuario a la URL de autorización
        window.location.href = data.authUrl;
      } else {
        setError('No se pudo obtener la URL de autorización');
      }
    } catch (err) {
      console.error('Error al conectar con SmartCar:', err);
      setError('Error al conectar con SmartCar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para actualizar token de acceso
  const refreshAccessToken = async () => {
    if (!refreshToken) return;
    
    try {
      const response = await fetch('/api/smartcar/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar token');
      }
      
      const data = await response.json();
      
      // Guardar nuevos tokens
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      
      localStorage.setItem('smartcar_access_token', data.access_token);
      localStorage.setItem('smartcar_refresh_token', data.refresh_token);
      localStorage.setItem('smartcar_token_expiry', data.expires_at);
    } catch (err) {
      console.error('Error al actualizar token:', err);
      
      // Si falla la actualización, limpiar tokens
      setAccessToken('');
      setRefreshToken('');
      localStorage.removeItem('smartcar_access_token');
      localStorage.removeItem('smartcar_refresh_token');
      localStorage.removeItem('smartcar_token_expiry');
    }
  };
  
  // Función para desconectar de SmartCar (limpiar tokens)
  const handleDisconnect = () => {
    setAccessToken('');
    setRefreshToken('');
    setConnectedVehicles([]);
    setSelectedVehicle(null);
    setVehicleData(null);
    
    localStorage.removeItem('smartcar_access_token');
    localStorage.removeItem('smartcar_refresh_token');
    localStorage.removeItem('smartcar_token_expiry');
  };
  
  // Función para obtener datos completos del vehículo
  const fetchVehicleData = async (vehicleId) => {
    if (!accessToken || !vehicleId) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(
        `/api/smartcar/vehicles/${vehicleId}/all?access_token=${accessToken}`
      );
      
      if (!response.ok) {
        if (response.status === 401 && refreshToken) {
          // Token expirado, intentar refrescar
          await refreshAccessToken();
          return;
        }
        throw new Error('Error al obtener datos del vehículo');
      }
      
      const data = await response.json();
      setVehicleData(data);
      setSelectedVehicle(vehicleId);
    } catch (err) {
      console.error('Error al obtener datos del vehículo:', err);
      setError('Error al obtener datos del vehículo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Procesar el código de autorización de la URL (para manejo del callback)
  useEffect(() => {
    const processAuthCode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          setLoading(true);
          
          const response = await fetch('/api/smartcar/exchange', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
          });
          
          if (!response.ok) {
            throw new Error('Error al intercambiar código');
          }
          
          const data = await response.json();
          
          // Guardar tokens
          setAccessToken(data.access_token);
          setRefreshToken(data.refresh_token);
          
          localStorage.setItem('smartcar_access_token', data.access_token);
          localStorage.setItem('smartcar_refresh_token', data.refresh_token);
          localStorage.setItem('smartcar_token_expiry', data.expires_at);
          
          // Limpiar URL para eliminar el código
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          setError('Error al procesar autorización: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    
    processAuthCode();
  }, []);
  
  // Verificar si el token está por expirar
  useEffect(() => {
    const checkTokenExpiry = () => {
      const expiryTime = localStorage.getItem('smartcar_token_expiry');
      
      if (expiryTime) {
        const expiry = new Date(expiryTime);
        const now = new Date();
        
        // Si faltan menos de 5 minutos para expirar, actualizar token
        if ((expiry - now) < 5 * 60 * 1000) {
          refreshAccessToken();
        }
      }
    };
    
    // Verificar al cargar y luego cada minuto
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [refreshToken]);

  // Renderizar datos del vehículo en formato legible
  const renderVehicleData = () => {
    if (!vehicleData) return null;
    
    return (
      <div className="vehicle-data">
        <h3>Datos del vehículo</h3>
        
        {/* Información básica */}
        {vehicleData.info && !vehicleData.info.error && (
          <div className="data-section">
            <h4>Información general</h4>
            <div className="data-grid">
              <div className="data-item">
                <span className="data-label">Marca:</span>
                <span className="data-value">{vehicleData.info.make}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Modelo:</span>
                <span className="data-value">{vehicleData.info.model}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Año:</span>
                <span className="data-value">{vehicleData.info.year}</span>
              </div>
              {vehicleData.info.vin && (
                <div className="data-item">
                  <span className="data-label">VIN:</span>
                  <span className="data-value">{vehicleData.info.vin}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Odómetro */}
        {vehicleData.odometer && !vehicleData.odometer.error && (
          <div className="data-section">
            <h4>Odómetro</h4>
            <div className="data-grid">
              <div className="data-item">
                <span className="data-label">Distancia:</span>
                <span className="data-value">{vehicleData.odometer.distance} km</span>
              </div>
              <div className="data-item">
                <span className="data-label">Actualizado:</span>
                <span className="data-value">
                  {new Date(vehicleData.odometer.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Combustible */}
        {vehicleData.fuel && !vehicleData.fuel.error && (
          <div className="data-section">
            <h4>Combustible</h4>
            <div className="data-grid">
              <div className="data-item">
                <span className="data-label">Nivel:</span>
                <span className="data-value">{Math.round(vehicleData.fuel.percent_remaining * 100)}%</span>
              </div>
              {vehicleData.fuel.range && (
                <div className="data-item">
                  <span className="data-label">Autonomía:</span>
                  <span className="data-value">{vehicleData.fuel.range} km</span>
                </div>
              )}
              <div className="data-item">
                <span className="data-label">Actualizado:</span>
                <span className="data-value">
                  {new Date(vehicleData.fuel.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Batería (vehículos eléctricos) */}
        {vehicleData.battery && !vehicleData.battery.error && (
          <div className="data-section">
            <h4>Batería</h4>
            <div className="data-grid">
              <div className="data-item">
                <span className="data-label">Nivel:</span>
                <span className="data-value">{Math.round(vehicleData.battery.percent_remaining * 100)}%</span>
              </div>
              {vehicleData.battery.range && (
                <div className="data-item">
                  <span className="data-label">Autonomía:</span>
                  <span className="data-value">{vehicleData.battery.range} km</span>
                </div>
              )}
              <div className="data-item">
                <span className="data-label">Actualizado:</span>
                <span className="data-value">
                  {new Date(vehicleData.battery.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Si el usuario está conectado y hay vehículos disponibles
  if (accessToken && connectedVehicles.length > 0) {
    return (
      <div className="smartcar-connect connected">
        <div className="connection-status">
          <h3>Conectado a SmartCar</h3>
          <button onClick={handleDisconnect} className="disconnect-button">
            Desconectar
          </button>
        </div>
        
        {connectedVehicles.length > 0 ? (
          <div className="vehicles-container">
            <h3>Vehículos disponibles</h3>
            <div className="vehicle-list">
              {connectedVehicles.map(vehicleId => (
                <div 
                  key={vehicleId}
                  className={`vehicle-item ${selectedVehicle === vehicleId ? 'selected' : ''}`}
                  onClick={() => fetchVehicleData(vehicleId)}
                >
                  <div className="vehicle-icon">🚗</div>
                  <div className="vehicle-info">
                    {/* Mostrar más información cuando se selecciona */}
                    {selectedVehicle === vehicleId && vehicleData?.info ? (
                      <>
                        <div className="vehicle-name">
                          {vehicleData.info.year} {vehicleData.info.make} {vehicleData.info.model}
                        </div>
                        {vehicleData.info.vin && (
                          <div className="vehicle-vin">VIN: {vehicleData.info.vin}</div>
                        )}
                      </>
                    ) : (
                      <div className="vehicle-name">
                        Vehículo {connectedVehicles.indexOf(vehicleId) + 1}
                      </div>
                    )}
                    <div className="vehicle-action">
                      {selectedVehicle === vehicleId ? 'Seleccionado' : 'Seleccionar'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {loading && (
              <div className="loading-data">
                <div className="loading-spinner"></div>
                <p>Cargando datos del vehículo...</p>
              </div>
            )}
            
            {vehicleData && (
              <div className="vehicle-data-container">
                {renderVehicleData()}
              </div>
            )}
          </div>
        ) : (
          <div className="no-vehicles">
            <p>No se encontraron vehículos conectados.</p>
            <button onClick={handleDisconnect} className="disconnect-button">
              Volver a conectar
            </button>
          </div>
        )}
      </div>
    );
  }
  
  // Si el usuario no está conectado
  return (
    <div className="smartcar-connect">
      {/* Mostrar estado de configuración cuando no esté configurado */}
      {!status?.configured && <SmartcarConfigStatus />}
      
      {status?.configured && (
        <div className="connect-container">
          <h3>Conecta tu vehículo</h3>
          <p>Conecta tu vehículo con SmartCar para obtener información en tiempo real.</p>
          
          <button 
            onClick={handleConnect} 
            disabled={loading}
            className="connect-button"
          >
            {loading ? 'Conectando...' : 'Conectar con SmartCar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartcarConnect;