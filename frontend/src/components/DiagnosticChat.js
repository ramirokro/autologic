import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './DiagnosticChat.css';

const DiagnosticChat = ({ selectedVehicle, onDiagnosticReceived, onLoadingChange, onError }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      text: 'Bienvenido a Autologic. Selecciona tu vehículo y describe el problema o los síntomas que estás experimentando. También puedes ingresar un código de error OBD-II si lo tienes.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Desplazarse al final de los mensajes cuando se añaden nuevos
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Actualizar el estado de loading en el componente padre
  useEffect(() => {
    onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    if (!selectedVehicle) {
      addMessage({
        type: 'error',
        text: 'Por favor, selecciona un vehículo antes de enviar tu consulta.'
      });
      return;
    }
    
    // Añadir mensaje del usuario
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue
    };
    
    addMessage(userMessage);
    setInputValue('');
    
    // Iniciar loading
    setIsLoading(true);
    
    try {
      // Determinar si el mensaje incluye un código OBD-II (formato típico: P0123, C1234, B0001, U0100)
      const codeMatch = inputValue.match(/[PCBU][0-9]{4}/i);
      const code = codeMatch ? codeMatch[0].toUpperCase() : null;
      
      // Preparar datos para la solicitud
      const requestData = {
        vehicle: selectedVehicle,
        symptoms: inputValue,
        language: 'es'
      };
      
      if (code) {
        requestData.code = code;
      }
      
      // Intentar enviar la solicitud a la API de FastAPI
      const response = await axios.post('/api/diagnose', requestData);
      
      // Añadir respuesta del sistema
      addMessage({
        id: Date.now() + 1,
        type: 'assistant',
        text: response.data.analysis,
        diagnosticData: response.data
      });
      
      // Enviar los datos de diagnóstico al componente padre
      onDiagnosticReceived(response.data);
      
    } catch (error) {
      console.error('Error al obtener diagnóstico:', error);
      
      // Mensaje de error amigable
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: 'Lo siento, ocurrió un error al procesar tu consulta. Por favor, intenta de nuevo más tarde.'
      };
      
      addMessage(errorMessage);
      
      // Notificar al componente padre
      onError(error.message || 'Error desconocido al procesar la consulta');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  return (
    <div className="diagnostic-chat">
      <div className="chat-header">
        <h2>Diagnóstico</h2>
        {selectedVehicle && (
          <div className="chat-vehicle-info">
            {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.engine}
          </div>
        )}
      </div>
      
      <div className="chat-messages">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message message-${message.type}`}
          >
            {message.type === 'system' && <div className="message-icon system-icon">🔧</div>}
            {message.type === 'user' && <div className="message-icon user-icon">👤</div>}
            {message.type === 'assistant' && <div className="message-icon assistant-icon">🤖</div>}
            {message.type === 'error' && <div className="message-icon error-icon">⚠️</div>}
            
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              {message.type === 'assistant' && message.diagnosticData && (
                <div className="message-diagnostic-preview">
                  <div className="diagnostic-causes">
                    <strong>Posibles causas:</strong>
                    <ul>
                      {message.diagnosticData.possible_causes.slice(0, 3).map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                      {message.diagnosticData.possible_causes.length > 3 && <li>...</li>}
                    </ul>
                  </div>
                  
                  <div className="diagnostic-severity">
                    <strong>Severidad:</strong> 
                    <span className={`severity-${message.diagnosticData.severity.toLowerCase()}`}>
                      {message.diagnosticData.severity}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message message-loading">
            <div className="message-icon loading-icon">⏳</div>
            <div className="message-content">
              <div className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={selectedVehicle 
            ? "Describe los síntomas o ingresa un código de error (por ejemplo, P0300)" 
            : "Primero selecciona tu vehículo..."
          }
          disabled={isLoading || !selectedVehicle}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim() || !selectedVehicle}>
          {isLoading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
};

export default DiagnosticChat;