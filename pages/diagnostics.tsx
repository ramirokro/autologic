import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';

import { 
  ChevronLeft, 
  Send, 
  CornerDownLeft, 
  Zap,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Terminal,
  Settings,
  Wrench
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  severity?: 'none' | 'low' | 'medium' | 'high';
}

const DiagnosticsPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  
  // Función para buscar productos para cada refacción recomendada
  const fetchProductsForRecommendedParts = async (parts: string[]) => {
    setIsLoadingProducts(true);
    console.log('Buscando productos para refacciones:', parts);
    
    try {
      const newProductsMap: {[key: string]: any[]} = {};
      
      // Hacer peticiones en paralelo para cada parte
      const requests = parts.map(async (part) => {
        try {
          // Extraer solo el nombre de la parte (sin los números o caracteres especiales)
          const cleanPart = part.replace(/[•\-*]/g, '').trim();
          console.log(`Buscando productos para: "${cleanPart}"`);
          
          // Datos del vehículo que se envían
          console.log('Datos del vehículo para búsqueda:', {
            marca: vehicleInfo.make,
            modelo: vehicleInfo.model,
            anio: vehicleInfo.year
          });
          
          const response = await apiRequest('POST', '/api/shopify/refaccion', {
            refaccion: cleanPart,
            marca: vehicleInfo.make || '',
            modelo: vehicleInfo.model || '',
            anio: vehicleInfo.year || null
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Respuesta para "${cleanPart}":`, data);
            
            if (data.success && data.productos && data.productos.length > 0) {
              // Guardar hasta 3 productos por refacción
              newProductsMap[cleanPart] = data.productos.slice(0, 3);
              console.log(`Se encontraron ${data.productos.length} productos para "${cleanPart}"`);
            } else {
              console.log(`No se encontraron productos para "${cleanPart}"`);
            }
          } else {
            console.error(`Error en respuesta para "${cleanPart}"`, response.status);
          }
        } catch (error) {
          console.error(`Error al buscar productos para ${part}:`, error);
        }
      });
      
      await Promise.all(requests);
      console.log('Mapa final de productos:', newProductsMap);
      setPartProducts(newProductsMap);
    } catch (error) {
      console.error('Error al buscar productos:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };
  const [vehicleInfo, setVehicleInfo] = useState<{
    year?: number;
    make?: string;
    model?: string;
    engine?: string;
  }>({});
  const [obdCodes, setObdCodes] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<string | null>(null);
  const [recommendedParts, setRecommendedParts] = useState<string[]>([]);
  const [partProducts, setPartProducts] = useState<{[key: string]: any[]}>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Al cargar la página, iniciar automáticamente con un mensaje de bienvenida y solicitud de información
  useEffect(() => {
    // Solo enviar el mensaje de inicio si no hay mensajes previos
    if (messages.length === 0) {
      const initialAssistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '¡Hola! Para poder brindarte un diagnóstico preciso, necesito conocer algunos datos básicos de tu vehículo. Por favor, indícame la marca, modelo y año de tu auto. Por ejemplo: "Tengo un Honda Civic 2018" o "Mi auto es un Volkswagen Jetta 2015".',
        severity: 'none'
      };
      setMessages([initialAssistantMessage]);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      handleSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  // Función para determinar la severidad basada en el texto del diagnóstico
  const determineSeverity = (diagnosis: string, severityStr?: string): 'none' | 'low' | 'medium' | 'high' => {
    // Si hay una cadena de severidad explícita, la usamos primero
    if (severityStr) {
      const severityLower = severityStr.toLowerCase();
      if (severityLower.includes('crítico') || 
          severityLower.includes('grave') || 
          severityLower.includes('peligroso')) {
        return 'high';
      } else if (severityLower.includes('moderado') || 
                severityLower.includes('advertencia') || 
                severityLower.includes('precaución')) {
        return 'medium';
      } else if (severityLower.includes('menor') || 
                severityLower.includes('leve') || 
                severityLower.includes('simple')) {
        return 'low';
      }
    }
    
    // Si no hay severidad explícita o no se reconoció, analizamos el diagnóstico
    const diagnosisLower = diagnosis.toLowerCase();
    
    // Palabras clave de alta severidad
    if (diagnosisLower.includes('peligro') || 
        diagnosisLower.includes('urgente') || 
        diagnosisLower.includes('no conducir') ||
        diagnosisLower.includes('inmediatamente') ||
        diagnosisLower.includes('grave') ||
        diagnosisLower.includes('fallo crítico')) {
      return 'high';
    } 
    
    // Palabras clave de severidad media
    else if (diagnosisLower.includes('precaución') || 
            diagnosisLower.includes('revisar pronto') || 
            diagnosisLower.includes('atención') ||
            diagnosisLower.includes('problema') ||
            diagnosisLower.includes('deterioro') ||
            diagnosisLower.includes('falla')) {
      return 'medium';
    } 
    
    // Palabras clave de baja severidad
    else if (diagnosisLower.includes('buen estado') || 
            diagnosisLower.includes('fácil solución') ||
            diagnosisLower.includes('no es grave') ||
            diagnosisLower.includes('mantenimiento') ||
            diagnosisLower.includes('revision rutinaria')) {
      return 'low';
    } 
    
    // Por defecto, si no encontramos palabras clave
    return 'none';
  };

  // Función para extraer información del vehículo de un mensaje
  const extractVehicleInfo = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Detectar marcas comunes
    const brands = [
      'toyota', 'honda', 'nissan', 'volkswagen', 'vw', 'ford', 'chevrolet', 'chevy', 
      'bmw', 'mercedes', 'audi', 'mazda', 'hyundai', 'kia', 'subaru', 'jeep', 
      'dodge', 'chrysler', 'fiat', 'renault', 'peugeot', 'seat', 'mitsubishi', 
      'suzuki', 'volvo', 'tesla', 'lexus', 'acura', 'infiniti', 'cadillac',
      'buick', 'gmc', 'ram', 'lincoln', 'jaguar', 'land rover', 'porsche'
    ];
    
    // Buscar coincidencias de marcas
    let detectedMake = '';
    for (const brand of brands) {
      if (lowerMessage.includes(brand)) {
        detectedMake = brand.charAt(0).toUpperCase() + brand.slice(1); // Capitalizar
        break;
      }
    }
    
    // Buscar años (1990-2030) para ser flexibles con posibles modelos futuros
    const yearMatch = lowerMessage.match(/\b(19[9][0-9]|20[0-3][0-9])\b/);
    const detectedYear = yearMatch ? parseInt(yearMatch[0]) : undefined;
    
    // Para el modelo, buscamos palabras que están cerca de la marca
    // o palabras que típicamente son modelos de vehículos
    let detectedModel = '';
    
    if (detectedMake) {
      // Buscar modelos conocidos según la marca detectada
      const brandModels: {[key: string]: string[]} = {
        'Toyota': ['corolla', 'camry', 'rav4', 'highlander', 'tacoma', 'tundra', 'yaris', 'prius', 'sienna', 'sequoia'],
        'Honda': ['civic', 'accord', 'cr-v', 'pilot', 'fit', 'hr-v', 'odyssey', 'ridgeline'],
        'Nissan': ['sentra', 'altima', 'maxima', 'versa', 'rogue', 'murano', 'pathfinder', 'frontier', 'titan'],
        'Volkswagen': ['jetta', 'passat', 'golf', 'tiguan', 'atlas', 'beetle', 'polo', 'taos'],
        'Ford': ['focus', 'fusion', 'mustang', 'escape', 'explorer', 'edge', 'f-150', 'ranger', 'expedition'],
        'Chevrolet': ['cruze', 'malibu', 'spark', 'sonic', 'impala', 'equinox', 'traverse', 'tahoe', 'suburban', 'silverado'],
        'Mazda': ['mazda3', 'mazda6', 'cx-3', 'cx-5', 'cx-9', 'mx-5'],
        'Hyundai': ['accent', 'elantra', 'sonata', 'tucson', 'santa fe', 'kona', 'palisade'],
        'Kia': ['rio', 'forte', 'optima', 'k5', 'sportage', 'sorento', 'telluride', 'soul']
      };
      
      const possibleModels = brandModels[detectedMake] || [];
      for (const model of possibleModels) {
        if (lowerMessage.includes(model)) {
          detectedModel = model.charAt(0).toUpperCase() + model.slice(1); // Capitalizar
          break;
        }
      }
    }
    
    // Actualizar el estado solo si se detectó alguna información
    if (detectedMake || detectedYear || detectedModel) {
      const updatedInfo = { ...vehicleInfo };
      
      if (detectedMake) updatedInfo.make = detectedMake;
      if (detectedYear) updatedInfo.year = detectedYear;
      if (detectedModel) updatedInfo.model = detectedModel;
      
      setVehicleInfo(updatedInfo);
      return updatedInfo;
    }
    
    return vehicleInfo;
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    
    // Extraer información del vehículo del mensaje
    const updatedVehicleInfo = extractVehicleInfo(message);
    console.log('Información del vehículo actualizada:', updatedVehicleInfo);

    try {
      // Prepare any additional info to send
      const additionalInfo = message;

      // Make API request to get AI diagnosis
      const response = await apiRequest('POST', '/api/diagnostics/analyze', {
        vehicleInfo: updatedVehicleInfo, // Usar la información actualizada del vehículo
        obdCodes,
        symptoms,
        additionalInfo,
        chatHistory: messages.map(m => ({ role: m.role, content: m.content }))
      });

      const data = await response.json();
      
      // Check if we got a valid response
      if (data.diagnosis) {
        // Determinar severidad basada en la respuesta
        const severity = determineSeverity(data.diagnosis, data.severity);
        
        // Almacenar la severidad como cadena para uso posterior
        if (data.severity) {
          setSeverity(data.severity);
        }
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.diagnosis,
          severity: severity
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Update recommended parts if available
        if (data.recommendedParts) {
          setRecommendedParts(data.recommendedParts);
          
          // Buscar productos para cada refacción recomendada
          fetchProductsForRecommendedParts(data.recommendedParts);
        }
      } else {
        throw new Error('No se recibió un diagnóstico válido');
      }
    } catch (error) {
      console.error('Error al obtener el diagnóstico:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta nuevamente.',
        severity: 'high'
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-black">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/')}
            className="hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="ml-2 font-mono uppercase tracking-wide text-zinc-300">
            AUTOLOGIC | <span className="text-green-500 font-bold">OBi-2</span>
            <span className="ml-2 text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-green-400">v1.0</span>
          </span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
            <span className="text-xs text-zinc-500 font-mono">SISTEMA ACTIVO</span>
          </div>
          {(vehicleInfo.make || vehicleInfo.model || vehicleInfo.year) && (
            <div className="text-xxs text-zinc-400 font-mono mt-1">
              {vehicleInfo.make && <span className="px-1 py-0.5 bg-zinc-800 rounded-sm mr-1">{vehicleInfo.make}</span>}
              {vehicleInfo.model && <span className="px-1 py-0.5 bg-zinc-800 rounded-sm mr-1">{vehicleInfo.model}</span>}
              {vehicleInfo.year && <span className="px-1 py-0.5 bg-zinc-800 rounded-sm">{vehicleInfo.year}</span>}
            </div>
          )}
        </div>
      </header>

      {/* Chat UI */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-grow overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="py-8">
                <div className="mx-auto max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg p-6 font-mono">
                  <div className="flex items-center mb-6">
                    <div className="relative w-12 h-12 bg-zinc-800 rounded-md flex items-center justify-center mr-4">
                      <Terminal className="h-6 w-6 text-green-400" />
                      <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-green-400">OBi-2 v1.0</h2>
                      <p className="text-zinc-400 text-xs">Asistente de Diagnóstico Automotriz</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 p-3 bg-zinc-800 rounded border border-zinc-700 text-green-300 text-sm">
                    <span className="text-zinc-500">$</span> <span className="text-green-400">./iniciar-diagnostico.sh</span>
                    <p className="mt-2">Sistema inicializado. Listo para recibir consultas.</p>
                  </div>
                  
                  <p className="text-zinc-400 mb-4 text-sm">
                    Describe los problemas de tu vehículo o síntomas que estás experimentando y 
                    te ayudaré a identificar posibles causas y soluciones.
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-300">Diagnóstico: Todo en orden</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-300">Diagnóstico: Atención requerida</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-300">Diagnóstico: Alerta importante</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-2">
                    Powered by Autologic™. Todos los derechos reservados.
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'user' ? (
                  <div className="w-8 h-8 rounded-md flex items-center justify-center ml-2 order-last flex-shrink-0 bg-zinc-800 border border-zinc-700 text-zinc-400">
                    <Terminal className="h-4 w-4" />
                  </div>
                ) : (
                  <div className={`
                    w-8 h-8 rounded-md flex items-center justify-center mr-2 flex-shrink-0 bg-zinc-800 border
                    ${message.severity === 'low' ? 'border-green-700 text-green-400' : 
                       message.severity === 'medium' ? 'border-amber-700 text-amber-400' :
                       message.severity === 'high' ? 'border-red-700 text-red-400' :
                       'border-zinc-700 text-blue-400'}
                  `}>
                    {message.severity === 'low' && <CheckCircle className="h-4 w-4" />}
                    {message.severity === 'medium' && <AlertTriangle className="h-4 w-4" />}
                    {message.severity === 'high' && <AlertCircle className="h-4 w-4" />}
                    {(!message.severity || message.severity === 'none') && <Terminal className="h-4 w-4" />}
                  </div>
                )}
                <div 
                  className={`
                    max-w-[80%] rounded-lg px-4 py-3 font-mono
                    ${message.role === 'user' 
                      ? 'bg-zinc-900 border border-blue-800/50 text-zinc-300' 
                      : message.severity === 'low' 
                        ? 'bg-zinc-900 border border-green-800 text-green-300' 
                        : message.severity === 'medium'
                          ? 'bg-zinc-900 border border-amber-800 text-amber-300'
                          : message.severity === 'high'
                            ? 'bg-zinc-900 border border-red-800 text-red-300'
                            : 'bg-zinc-900 border border-zinc-700 text-zinc-300'
                    }
                  `}
                >
                  {message.role === 'assistant' ? (
                    <div className="flex items-center text-xs font-medium mb-2 border-b pb-1 border-opacity-30 space-x-1">
                      <span className={`
                        ${message.severity === 'low' ? 'text-green-400' : 
                           message.severity === 'medium' ? 'text-amber-400' :
                           message.severity === 'high' ? 'text-red-400' :
                           'text-blue-400'}
                      `}>
                        <span className="text-zinc-400">[</span>
                        OBi-2
                        <span className="text-zinc-400">]</span>
                      </span>
                      <span className="text-zinc-500">$</span>
                      <span className={`
                        ${message.severity === 'low' ? 'text-green-500' : 
                           message.severity === 'medium' ? 'text-amber-500' :
                           message.severity === 'high' ? 'text-red-500' :
                           'text-blue-500'}
                      `}>
                        {message.severity === 'low' && "diagnostico --estado='todo_en_orden'"}
                        {message.severity === 'medium' && "diagnostico --estado='atencion_requerida'"}
                        {message.severity === 'high' && "diagnostico --estado='alerta_importante'"}
                        {(!message.severity || message.severity === 'none') && "diagnostico --analisis"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-xs font-medium mb-2 border-b pb-1 border-zinc-700 space-x-1">
                      <span className="text-blue-400">
                        <span className="text-zinc-400">[</span>
                        Usuario
                        <span className="text-zinc-400">]</span>
                      </span>
                      <span className="text-zinc-500">$</span>
                      <span className="text-blue-500">obi --consulta</span>
                    </div>
                  )}
                  <div 
                    className={`whitespace-pre-wrap ${
                      message.severity === 'low' ? 'text-green-300' : 
                      message.severity === 'medium' ? 'text-amber-300' :
                      message.severity === 'high' ? 'text-red-300' :
                      'text-zinc-300'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        // Convertir los enlaces markdown [texto](url) a HTML <a> tags
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300">$1</a>')
                        // Preservar los saltos de línea
                        .replace(/\n/g, '<br />')
                    }}
                  />
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center mr-2 flex-shrink-0">
                  <Terminal className="h-4 w-4 text-green-400 animate-pulse" />
                </div>
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-zinc-900 border border-zinc-700 text-green-400 font-mono">
                  <div className="flex items-center text-xs font-medium mb-2 border-b border-zinc-800 pb-1 space-x-1">
                    <span className="text-green-400">
                      <span className="text-zinc-400">[</span>
                      OBi-2
                      <span className="text-zinc-400">]</span>
                    </span>
                    <span className="text-zinc-500">$</span>
                    <span className="text-green-500">ejecutar --proceso='analisis-diagnostico'</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-1 opacity-70">$</span> 
                    <div className="flex flex-col">
                      <span className="text-xs opacity-70">Procesando datos...</span>
                      <div className="flex items-center mt-1 space-x-1">
                        <span className="inline-block w-3 h-3 bg-green-500 opacity-90 animate-pulse"></span>
                        <span className="text-xs opacity-70">Analizando información</span>
                      </div>
                      <div className="h-4 mt-1">
                        <span className="inline-block animate-blink">_</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-zinc-800 p-4 bg-black">
          <form 
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex items-center space-x-2"
          >
            <div className="flex items-center text-green-500 font-mono text-sm mr-2">
              <span className="opacity-80">{'>'}</span>
            </div>
            <div className="relative flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ingrese comando o descripción del problema..."
                className="bg-zinc-900 border-zinc-700 text-zinc-300 font-mono focus-visible:ring-green-500 focus-visible:ring-opacity-50"
                disabled={isThinking}
              />
            </div>
            <Button 
              type="submit" 
              size="icon"
              variant="outline"
              className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-green-500"
              disabled={!inputMessage.trim() || isThinking}
            >
              <Terminal className="h-4 w-4" />
              <span className="sr-only">Ejecutar</span>
            </Button>
          </form>
          <div className="max-w-3xl mx-auto mt-1.5 flex justify-end">
            <div className="text-xs text-zinc-500 font-mono">OBi-2 v1.0 · Diagnóstico en tiempo real</div>
          </div>
        </div>
      </main>

      {/* Recommended parts (shown when available) */}
      {recommendedParts.length > 0 && (
        <div className="border-t border-zinc-800 p-4 bg-black">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center text-xs font-mono text-green-400 mb-2">
              <span className="text-zinc-500 mr-1.5">[</span>
              <span>PIEZAS RECOMENDADAS</span>
              <span className="text-zinc-500 ml-1.5">]</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3 font-mono">
              <div className="flex items-start mb-2">
                <span className="text-zinc-500 mr-2 text-sm">$</span>
                <span className="text-green-400 text-sm">listar-refacciones</span>
              </div>
              <div className="pl-4 space-y-3">
                {recommendedParts.map((part, index) => {
                  // Limpiar el nombre de la parte para buscar en el mapa de productos
                  const cleanPart = part.replace(/[•\-*]/g, '').trim();
                  const products = partProducts[cleanPart] || [];
                  
                  return (
                    <div key={index} className="text-zinc-300 text-xs">
                      <div className="flex items-center mb-1">
                        <span className="text-zinc-500 mr-2">-</span>
                        <span className="text-amber-300">{part}</span>
                      </div>
                      
                      {isLoadingProducts && (
                        <div className="ml-6 p-2 border border-zinc-800 rounded-sm bg-zinc-950">
                          <div className="flex items-center text-green-400 text-xs">
                            <div className="animate-spin w-3 h-3 border border-green-400 border-t-transparent rounded-full mr-2"></div>
                            <span>Buscando productos...</span>
                          </div>
                        </div>
                      )}
                      
                      {!isLoadingProducts && products.length > 0 && (
                        <div className="ml-6 border border-zinc-800 rounded-sm">
                          <div className="p-1.5 border-b border-zinc-800 bg-zinc-950">
                            <span className="text-zinc-400 text-xs font-semibold">Productos disponibles:</span>
                          </div>
                          <div className="divide-y divide-zinc-800">
                            {products.map((product, productIdx) => (
                              <div key={productIdx} className="p-2 hover:bg-zinc-800/50 transition-colors">
                                <a 
                                  href={product.url || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <div className="text-green-400 hover:underline">{product.title}</div>
                                  <div className="flex justify-between items-center mt-1">
                                    <div className="text-amber-400 font-bold">
                                      ${product.price?.toFixed(2)}
                                    </div>
                                    <button className="text-xxs border border-green-700 bg-green-700/20 hover:bg-green-700/40 rounded px-1.5 py-0.5 text-green-400 transition-colors">
                                      Ver detalles
                                    </button>
                                  </div>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {!isLoadingProducts && products.length === 0 && (
                        <div className="ml-6 p-2 border border-zinc-800 rounded-sm bg-zinc-950">
                          <span className="text-zinc-400 text-xs">No se encontraron productos para esta refacción</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end mt-3">
                <Button size="sm" variant="outline" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-green-400 text-xs font-mono" asChild>
                  <a href="/diagnostics/details/latest">
                    <span className="mr-1.5">{'>'}</span>Ver catálogo completo
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPage;