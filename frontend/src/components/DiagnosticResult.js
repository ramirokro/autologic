import React from 'react';
import './DiagnosticResult.css';

const DiagnosticResult = ({ diagnostic, vehicle }) => {
  if (!diagnostic || !vehicle) return null;
  
  // Función para determinar la clase de severidad
  const getSeverityClass = (severity) => {
    const severityLower = severity.toLowerCase();
    if (severityLower === 'bajo' || severityLower === 'baja') return 'low';
    if (severityLower === 'medio' || severityLower === 'media') return 'medium';
    if (severityLower === 'alto' || severityLower === 'alta') return 'high';
    if (severityLower === 'crítico' || severityLower === 'critico') return 'critical';
    return 'medium'; // Default
  };
  
  // Función para obtener icono basado en la urgencia
  const getUrgencyIcon = (urgency) => {
    const urgencyLower = urgency.toLowerCase();
    if (urgencyLower.includes('inmediato') || urgencyLower.includes('urgente')) return '🚨';
    if (urgencyLower.includes('pronto') || urgencyLower.includes('recomendado')) return '⚠️';
    if (urgencyLower.includes('cuando') || urgencyLower.includes('próximo')) return 'ℹ️';
    if (urgencyLower.includes('opcional') || urgencyLower.includes('eventual')) return '📌';
    return '🔧'; // Default
  };

  return (
    <div className="diagnostic-result">
      <div className="result-header">
        <h2>Resultado del diagnóstico</h2>
        <div className="vehicle-info">
          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.engine}
        </div>
      </div>
      
      <div className="result-severity-bar">
        <div className="severity-label">Severidad:</div>
        <div className={`severity-indicator ${getSeverityClass(diagnostic.severity)}`}>
          {diagnostic.severity}
        </div>
      </div>
      
      <div className="result-section">
        <h3>Análisis</h3>
        <div className="result-content">
          {diagnostic.analysis}
        </div>
      </div>
      
      <div className="result-columns">
        <div className="result-section">
          <h3>Posibles causas</h3>
          <ul className="causes-list">
            {diagnostic.possible_causes.map((cause, index) => (
              <li key={index}>{cause}</li>
            ))}
          </ul>
        </div>
        
        <div className="result-section">
          <h3>Acciones recomendadas</h3>
          <ol className="actions-list">
            {diagnostic.recommended_actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ol>
        </div>
      </div>
      
      <div className="result-section parts-section">
        <h3>Piezas que podrían necesitar revisión o reemplazo</h3>
        
        <div className="parts-grid">
          {diagnostic.parts.map((part, index) => (
            <div key={index} className="part-card">
              <div className="part-header">
                <span className="part-urgency-icon">{getUrgencyIcon(part.urgency)}</span>
                <h4 className="part-name">{part.name}</h4>
              </div>
              <p className="part-description">{part.description}</p>
              <div className="part-urgency">
                <span className="urgency-label">Urgencia:</span>
                <span className={`urgency-value ${getSeverityClass(part.urgency)}`}>{part.urgency}</span>
              </div>
              <button className="find-part-btn">Buscar pieza</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="result-actions">
        <button className="action-btn save-btn">Guardar diagnóstico</button>
        <button className="action-btn share-btn">Compartir</button>
        <button className="action-btn print-btn">Imprimir</button>
      </div>
    </div>
  );
};

export default DiagnosticResult;