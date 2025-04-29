import React from 'react';
import SmartcarConnect from '../components/SmartcarConnect';
import './VehicleConnectPage.css';

const VehicleConnectPage = () => {
  return (
    <div className="vehicle-connect-page">
      <div className="page-header">
        <h1>Conecta tu vehículo</h1>
        <p>Obtén diagnósticos en tiempo real conectando tu vehículo directamente a Autologic.</p>
      </div>
      
      <div className="connect-benefits">
        <div className="benefit-item">
          <div className="benefit-icon">📊</div>
          <div className="benefit-content">
            <h3>Diagnósticos precisos</h3>
            <p>Accede a datos en tiempo real para obtener diagnósticos más precisos y detallados.</p>
          </div>
        </div>
        
        <div className="benefit-item">
          <div className="benefit-icon">🔍</div>
          <div className="benefit-content">
            <h3>Monitoreo constante</h3>
            <p>Supervisa el estado de tu vehículo y recibe alertas sobre posibles problemas.</p>
          </div>
        </div>
        
        <div className="benefit-item">
          <div className="benefit-icon">⚡</div>
          <div className="benefit-content">
            <h3>Respuesta rápida</h3>
            <p>Obtén recomendaciones inmediatas basadas en los datos reales de tu vehículo.</p>
          </div>
        </div>
      </div>
      
      <SmartcarConnect />
      
      <div className="connect-faq">
        <h2>Preguntas frecuentes</h2>
        
        <div className="faq-item">
          <h3>¿Qué es SmartCar?</h3>
          <p>SmartCar es una plataforma segura que permite a Autologic conectarse con los datos de tu vehículo para proporcionar diagnósticos precisos.</p>
        </div>
        
        <div className="faq-item">
          <h3>¿Es segura la conexión?</h3>
          <p>Sí, SmartCar utiliza protocolos de seguridad avanzados y solo accede a los datos que tú autorizas explícitamente.</p>
        </div>
        
        <div className="faq-item">
          <h3>¿Qué vehículos son compatibles?</h3>
          <p>SmartCar es compatible con la mayoría de los vehículos fabricados después de 2014 que cuentan con conectividad integrada.</p>
        </div>
        
        <div className="faq-item">
          <h3>¿Qué datos se recopilan?</h3>
          <p>Autologic recopila información como odómetro, nivel de combustible/batería, presión de neumáticos y estado del motor para proporcionar diagnósticos precisos.</p>
        </div>
      </div>
    </div>
  );
};

export default VehicleConnectPage;