import React, { useState } from 'react';
import VehicleSelector from '../components/VehicleSelector';
import DiagnosticChat from '../components/DiagnosticChat';
import DiagnosticResult from '../components/DiagnosticResult';
import './HomePage.css';

const HomePage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="home-page">
      <div className="content-container">
        <div className="left-panel">
          <VehicleSelector 
            onVehicleSelect={setSelectedVehicle} 
            selectedVehicle={selectedVehicle}
          />
        </div>
        
        <div className="right-panel">
          <DiagnosticChat 
            selectedVehicle={selectedVehicle}
            onDiagnosticReceived={setDiagnostic}
            onLoadingChange={setLoading}
            onError={setError}
          />

          {diagnostic && (
            <DiagnosticResult 
              diagnostic={diagnostic} 
              vehicle={selectedVehicle}
            />
          )}

          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Analizando el problema...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;