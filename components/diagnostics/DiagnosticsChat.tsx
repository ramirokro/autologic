import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/app-context';
import { useVehicle } from '@/hooks/use-vehicle';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { 
  buscarProductosPorRefaccion, 
  buscarMultiplesRefacciones,
  Producto, 
  generarMensajeProductos, 
  generarMensajeMultiplesRefacciones,
  generarEnlaceCarrito 
} from '@/lib/shopify';
import { generarMensajeRefaccionesShopify } from '@/lib/shopify_refaccion';
import { generarPDFDiagnostico, generarPDFDiagnosticoProfesional } from '@/lib/pdfService';
import { contextManager, NivelUsuario, VehiculoContexto } from '@/lib/contextManager';

// Diccionario de síntomas comunes y refacciones recomendadas
const sintomasDiagnostico: {[key: string]: {diagnostico: string; refacciones: string[]}} = {
  "tironea": {
    diagnostico: "Tirones o jalones al acelerar, posiblemente por problemas de inyección o encendido",
    refacciones: ["Bujías", "Cables de encendido", "Bobinas de encendido", "Filtro de combustible", "Inyectores"]
  },
  "jalonea": {
    diagnostico: "Tirones o jalones al acelerar, posiblemente por problemas de inyección o encendido",
    refacciones: ["Bujías", "Cables de encendido", "Bobinas de encendido", "Filtro de combustible", "Inyectores"]
  },
  "humo": {
    diagnostico: "Emisión de humo del escape, indica problemas de combustión",
    refacciones: ["Sensor de oxígeno", "Válvulas", "Anillos de pistón", "Convertidor catalítico", "Sello de válvulas"]
  },
  "olor a gasolina": {
    diagnostico: "Olor a combustible, posible fuga en el sistema de combustible",
    refacciones: ["Mangueras de combustible", "Sellos de inyectores", "Regulador de presión", "O-rings del riel de inyección"]
  },
  "calentamiento": {
    diagnostico: "Sobrecalentamiento del motor, problemas en el sistema de enfriamiento",
    refacciones: ["Termostato", "Bomba de agua", "Radiador", "Ventilador de enfriamiento", "Mangueras de radiador"]
  },
  "frenos": {
    diagnostico: "Problemas en el sistema de frenos, posible desgaste o falla hidráulica",
    refacciones: ["Pastillas de freno", "Discos/Rotores", "Líquido de frenos", "Cilindro maestro", "Mangueras de freno"]
  },
  "dirección": {
    diagnostico: "Problemas de dirección, posibles fallas en el sistema de dirección asistida",
    refacciones: ["Bomba de dirección hidráulica", "Líquido de dirección", "Terminales de dirección", "Cremallera de dirección"]
  },
  "ruido": {
    diagnostico: "Ruidos anormales, pueden provenir de diversas partes del vehículo",
    refacciones: ["Rodamientos", "Tensores", "Poleas", "Soportes de motor", "Amortiguadores"]
  },
  "vibración": {
    diagnostico: "Vibraciones al conducir, posibles problemas de balanceo o suspensión",
    refacciones: ["Baleros de rueda", "Amortiguadores", "Rótulas", "Terminales de dirección", "Llantas"]
  },
  "arranca": {
    diagnostico: "Problemas para arrancar el vehículo, posibles fallas eléctricas o de combustible",
    refacciones: ["Batería", "Alternador", "Motor de arranque", "Bomba de combustible", "Regulador de presión"]
  },
  "gasolina": {
    diagnostico: "Alto consumo de combustible, posibles problemas en el sistema de inyección",
    refacciones: ["Sensor MAF", "Sensor de oxígeno", "Inyectores", "Filtro de aire", "Válvula EGR"]
  },
  "luces": {
    diagnostico: "Problemas con el sistema eléctrico o luces del vehículo",
    refacciones: ["Focos", "Relevadores", "Fusibles", "Arnés eléctrico", "Interruptores"]
  }
};

// Sistema de respuestas adaptativas de OBi-2 según el nivel técnico del usuario
const respuestasRapidasObi: {[key: string]: {[nivel: string]: string}} = {
  "no_arranca": {
    novato: "Tranquilo. Lo primero es revisar la batería. ¿Notas si se encienden las luces del tablero?",
    intermedio: "Podría ser batería, motor de arranque o alternador. ¿Hay clic al girar la llave?",
    experto: "Probablemente es un fallo en el circuito de encendido o señal al arranque. ¿Ya probaste con escáner?"
  },
  "huele_quemado": {
    novato: "Ese olor puede asustar, pero vamos a revisarlo juntos. A veces son frenos calientes.",
    intermedio: "Puede ser freno forzado, embrague desgastado o cableado. ¿Qué más notas?",
    experto: "Revisar temperatura de frenos, clutch o carga en el alternador. ¿Hay pérdida de potencia?"
  },
  "se_jalonea": {
    novato: "Esto pasa cuando el motor no está recibiendo bien aire o gasolina. Vamos a revisar lo básico.",
    intermedio: "Sensor MAF, bujías o inyectores sucios podrían ser la causa. ¿Último mantenimiento?",
    experto: "Mezcla pobre/rica por lectura errática. ¿Tienes códigos como P0171 o registros de presión?"
  }
};

import {
  Card,
  CardContent
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { 
  PlusCircle, 
  SendHorizontal, 
  X, 
  Info, 
  Car, 
  AlertCircle, 
  Check, 
  Save, 
  Loader2,
  FileDown,
  ShoppingCart
} from 'lucide-react';

interface DiagnosticsChatProps {
  onDiagnosticSaved?: () => void;
}

// Interfaces para el chat
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DiagnosticsChat: React.FC<DiagnosticsChatProps> = ({ onDiagnosticSaved }) => {
  const { currentUser } = useAuth();
  const { selectedVehicle } = useVehicle();
  const { toast } = useToast();
  
  // Estado del diagnóstico
  const [obdCodes, setObdCodes] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [newItem, setNewItem] = useState('');
  const [isOBDMode, setIsOBDMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDiagnosis, setHasDiagnosis] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [severity, setSeverity] = useState<string>('media');
  
  // Estado para productos recomendados
  const [productosRecomendados, setProductosRecomendados] = useState<Producto[]>([]);
  
  // Estado para nivel técnico del usuario - usando Context Manager
  const [nivelUsuario, setNivelUsuario] = useState<NivelUsuario>(
    contextManager.contexto.nivelUsuario
  );
  
  // Referencia al final del chat para scroll automático
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Sugerencias de códigos OBD comunes
  const commonOBDCodes = [
    { code: 'P0300', description: 'Fallo de encendido aleatorio/múltiple' },
    { code: 'P0171', description: 'Sistema demasiado pobre (Banco 1)' },
    { code: 'P0420', description: 'Eficiencia del catalizador por debajo del umbral (Banco 1)' },
    { code: 'P0455', description: 'Fuga grande detectada en sistema EVAP' },
    { code: 'P0401', description: 'Flujo insuficiente de EGR' },
    { code: 'P0303', description: 'Fallo de encendido detectado - Cilindro 3' },
  ];
  
  // Sugerencias de síntomas comunes
  const commonSymptoms = [
    'El motor no arranca',
    'Tirones al acelerar',
    'Consumo excesivo de combustible',
    'Luz del motor encendida',
    'Ruido anormal al frenar',
    'Pérdida de potencia',
    'Vibración al conducir',
    'Humo del escape',
    'Dificultad para cambiar de marcha',
    'Sobrecalentamiento del motor',
  ];
  
  // Scroll al final del chat cuando se añade un mensaje
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Agregar código OBD
  const addOBDCode = () => {
    if (!newItem || obdCodes.includes(newItem)) return;
    
    // Formato básico de validación para códigos OBD-II (P0XXX, C0XXX, B0XXX, U0XXX)
    const odbPattern = /^[PCBU][0-9][0-9A-F][0-9A-F][0-9A-F]$/i;
    
    if (!odbPattern.test(newItem)) {
      toast({
        title: 'Formato inválido',
        description: 'El código OBD debe tener el formato PXXXX, CXXXX, BXXXX o UXXX',
        variant: 'destructive'
      });
      return;
    }
    
    setObdCodes([...obdCodes, newItem.toUpperCase()]);
    setNewItem('');
  };
  
  // Agregar síntoma
  const addSymptom = () => {
    if (!newItem || symptoms.includes(newItem)) return;
    setSymptoms([...symptoms, newItem]);
    setNewItem('');
  };
  
  // Eliminar código OBD
  const removeOBDCode = (code: string) => {
    setObdCodes(obdCodes.filter(c => c !== code));
  };
  
  // Eliminar síntoma
  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };
  
  // Función para analizar síntomas en el texto
  const analizarSintomas = (texto: string): {diagnostico: string, refacciones: string[]} | null => {
    const textoLimpio = texto.toLowerCase();
    
    // Buscar coincidencias con palabras clave en el diccionario de síntomas
    for (const [palabra, info] of Object.entries(sintomasDiagnostico)) {
      if (textoLimpio.includes(palabra)) {
        return info;
      }
    }
    
    return null;
  };
  
  // Función local para detectar nivel de conocimiento del usuario
  const obtenerNivelUsuario = (texto: string): NivelUsuario => {
    // Si ya tenemos un nivel definido en el contexto, lo usamos
    const nivelActual = contextManager.contexto.nivelUsuario;
    if (nivelActual === 'novato' || nivelActual === 'intermedio' || nivelActual === 'experto') {
      return nivelActual;
    }
    
    // De lo contrario, analizamos el texto para detectar el nivel
    const t = texto.toLowerCase();
    
    if (t.includes("nada") || t.includes("no sé") || t.includes("novato") || 
        t.includes("principiante") || t.includes("básico")) {
      return "novato";
    }
    if (t.includes("poco") || t.includes("intermedio") || t.includes("aprendiendo") || 
        t.includes("algo sé") || t.includes("conozco algo")) {
      return "intermedio";
    }
    if (t.includes("sé bastante") || t.includes("experto") || t.includes("ya sé") || 
        t.includes("avanzado") || t.includes("conocimiento técnico")) {
      return "experto";
    }
    
    // Default si no se detecta
    return "intermedio";
  };
  
  // Función para generar respuesta adaptada al nivel del usuario
  const generarRespuestaContextual = (contenido: string): string => {
    if (!nivelUsuario) {
      return contenido;
    }
    
    // Añadir personalidad según el nivel técnico
    let prefijo = '';
    let sufijo = '';
    
    switch (nivelUsuario) {
      case 'novato':
        // Tono amigable, explicativo y tranquilizador
        prefijo = '🛠️ **OBi-2 dice:** ¡Tranquilo! Estoy aquí para ayudarte paso a paso.\n\n';
        sufijo = '\n\n¿Hay algo más que quieras saber? Puedes preguntarme cualquier duda. 😊';
        break;
      case 'intermedio':
        // Tono profesional pero accesible
        prefijo = '🛠️ **OBi-2 dice:** Perfecto, aquí tienes la información que necesitas.\n\n';
        sufijo = '\n\n¿Necesitas que profundice en algún aspecto? Estoy para ayudarte.';
        break;
      case 'experto':
        // Tono técnico y directo
        prefijo = '🛠️ **OBi-2 dice:** Basado en los datos técnicos:\n\n';
        sufijo = '\n\n¿Requieres información adicional sobre especificaciones o procedimientos?';
        break;
    }
    
    // Reemplazar términos técnicos con explicaciones para novatos
    let contenidoModificado = contenido;
    
    if (nivelUsuario === 'novato') {
      // Simplificar términos técnicos
      const terminos = {
        'OBD': 'sistema de diagnóstico del vehículo',
        'ECU': 'computadora del vehículo',
        'sensor MAP': 'sensor que mide la presión del aire',
        'sensor MAF': 'sensor que mide el flujo de aire',
        'inyector': 'dispositivo que introduce combustible al motor',
        'sonda lambda': 'sensor de oxígeno',
        'catalizador': 'dispositivo que reduce contaminantes',
        'relación estequiométrica': 'mezcla ideal de aire y combustible',
        'mezcla rica': 'exceso de combustible',
        'mezcla pobre': 'falta de combustible',
        'válvula EGR': 'válvula que reduce emisiones',
        'códigos DTC': 'códigos de error',
        'turbocompresor': 'dispositivo que aumenta la potencia del motor',
        'sistema EVAP': 'sistema que controla los vapores de combustible'
      };
      
      Object.entries(terminos).forEach(([termino, explicacion]) => {
        const regex = new RegExp(`\\b${termino}\\b`, 'gi');
        contenidoModificado = contenidoModificado.replace(regex, `${termino} (${explicacion})`);
      });
    }
    
    return prefijo + contenidoModificado + sufijo;
  };
  
  // Función para responder desde botones de acciones rápidas
  const responderDesdeBoton = (codigoSituacion: string) => {
    const nivel = nivelUsuario || "novato";
    let respuesta = respuestasRapidasObi[codigoSituacion][nivel];
    
    // Mensaje del usuario (lo que seleccionó)
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: `[Problema: ${codigoSituacion.replace("_", " ")}]`,
      timestamp: new Date()
    };
    
    // Añadir personalidad de OBi-2 según el nivel técnico
    if (nivel === 'novato') {
      respuesta = `🛠️ **OBi-2 dice:** ¡Tranquilo! Estamos frente a un problema común.\n\n${respuesta}\n\n¿Hay algo más que quieras saber? 😊`;
    } else if (nivel === 'intermedio') {
      respuesta = `🛠️ **OBi-2 dice:** Veamos este problema con detalle.\n\n${respuesta}\n\n¿Necesitas que profundice en algún aspecto?`;
    } else if (nivel === 'experto') {
      respuesta = `🛠️ **OBi-2 dice:** Analizando el problema reportado:\n\n${respuesta}\n\n¿Requieres detalles adicionales sobre componentes específicos?`;
    }
    
    // Respuesta de OBi adaptada al nivel
    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: respuesta,
      timestamp: new Date()
    };
    
    // Agregar ambos mensajes al historial
    setChatHistory(prev => [...prev, userMessage, assistantMessage]);
    
    // Scroll al final
    setTimeout(scrollToBottom, 100);
  };

  // Enviar mensaje al chat
  const sendMessage = async () => {
    if (!currentInput.trim() && chatHistory.length === 0) {
      // Si es el primer mensaje y no hay texto, usar los datos del formulario
      await startDiagnostic();
      return;
    }
    
    if (!currentInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    };
    
    setChatHistory([...chatHistory, userMessage]);
    setCurrentInput('');
    setIsLoading(true);
    
    // Actualizar contexto con el mensaje del usuario y detectar nivel
    if (selectedVehicle) {
      const vehiculoContexto: VehiculoContexto = {
        make: selectedVehicle.make,
        model: selectedVehicle.model,
        year: selectedVehicle.year,
        engine: selectedVehicle.engine ? selectedVehicle.engine : undefined,
        transmission: selectedVehicle.transmission ? selectedVehicle.transmission : undefined
      };
      contextManager.registrarPregunta(userMessage.content);
      contextManager.actualizarVehiculo(vehiculoContexto);
    } else {
      contextManager.registrarPregunta(userMessage.content);
    }
    
    // Obtener nivel actualizado
    const posibleNivel = contextManager.contexto.nivelUsuario;
    if (posibleNivel !== nivelUsuario) {
      // Actualizar estado local
      setNivelUsuario(posibleNivel);
      
      // Informar al usuario que se ha adaptado el nivel
      const mensajeNivel = posibleNivel === "novato" ? 
        "¡No te preocupes! Explicaré todo de forma sencilla y paso a paso." :
        (posibleNivel === "intermedio" ? 
          "Perfecto, utilizaré términos técnicos pero con explicaciones claras." :
          "Excelente, usaré lenguaje técnico avanzado sin explicaciones básicas.");
          
      const nivelMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `Entendido, adaptaré mis respuestas a tu nivel de conocimiento: **${posibleNivel}**.\n\n${mensajeNivel}`,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, nivelMessage]);
    }
    
    // Detectar síntomas en el mensaje del usuario
    const sintomaDetectado = analizarSintomas(userMessage.content);
    
    // Si se detectó un síntoma, responder inmediatamente con recomendaciones
    if (sintomaDetectado) {
      setIsLoading(true);
      
      // Mensaje inicial sobre el síntoma detectado - ahora más enfocado a soluciones comerciales
      let mensajePersonalizado = nivelUsuario === 'novato' ? 
        `¡No te preocupes! Entiendo que tu vehículo está experimentando: **${sintomaDetectado.diagnostico}**.\n\n` :
        (nivelUsuario === 'intermedio' ? 
          `He analizado tu situación y detecté que se trata de: **${sintomaDetectado.diagnostico}**.\n\n` : 
          `Diagnóstico: **${sintomaDetectado.diagnostico}**.\n\n`);
          
      mensajePersonalizado += `**Refacciones recomendadas para resolver tu problema:**\n${sintomaDetectado.refacciones.map(ref => `• ${ref}`).join('\n')}\n\n`;
      mensajePersonalizado += `Voy a buscar estas refacciones específicas en nuestro catálogo para que no tengas que preocuparte por la compatibilidad.`;
      
      const recomendacionMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: mensajePersonalizado,
        timestamp: new Date()
      };
      
      // Agregamos un mensaje inicial con las recomendaciones
      setChatHistory(prev => [...prev, recomendacionMessage]);
      
      try {
        // Registramos diagnóstico y refacciones en el Context Manager
        contextManager.agregarDiagnostico(sintomaDetectado.diagnostico);
        sintomaDetectado.refacciones.forEach(refaccion => {
          contextManager.agregarRefaccion(refaccion);
        });
        contextManager.actualizarIntencion('buscar_producto');
        
        // Buscamos productos en Shopify para las refacciones recomendadas
        if (sintomaDetectado.refacciones.length > 0 && selectedVehicle) {
          // Limitar a las primeras 3 refacciones para no hacer demasiadas consultas
          const refaccionesPrincipales = sintomaDetectado.refacciones.slice(0, 3);
          
          console.log(`Buscando productos para ${refaccionesPrincipales.length} refacciones:`);
          console.log(refaccionesPrincipales.join(', '));
          
          try {
            console.log(`Buscando refacciones para ${selectedVehicle.make} ${selectedVehicle.model} ${selectedVehicle.year}:`);
            
            // Usar la nueva función para buscar múltiples refacciones en paralelo
            const productosPorRefaccion = await buscarMultiplesRefacciones(
              refaccionesPrincipales,
              selectedVehicle.make,
              selectedVehicle.model,
              selectedVehicle.year,
              2 // Limitamos a 2 productos por refacción para mostrar resultados más relevantes
            );
            
            // Contar productos totales
            let contadorTotal = 0;
            Object.keys(productosPorRefaccion).forEach(refaccion => {
              const cantidad = productosPorRefaccion[refaccion].length;
              contadorTotal += cantidad;
              console.log(`- ${refaccion}: ${cantidad} productos encontrados`);
            });
            
            console.log(`Total productos encontrados: ${contadorTotal}`);
            
            // Si encontramos productos, mostramos un mensaje adicional
            if (contadorTotal > 0) {
              // Crear un array plano con todos los productos para el estado
              const todosProductos: Producto[] = [];
              Object.values(productosPorRefaccion).forEach(productos => {
                todosProductos.push(...productos);
              });
              
              // Actualizar productos recomendados
              setProductosRecomendados(todosProductos);
              
              // Crear mensaje con productos optimizado para tienda Shopify
              const productosMessage: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: generarMensajeRefaccionesShopify(
                  productosPorRefaccion, 
                  {
                    make: selectedVehicle.make,
                    model: selectedVehicle.model,
                    year: selectedVehicle.year,
                    engine: selectedVehicle.engine ? selectedVehicle.engine : undefined
                  },
                  'Encontré estas refacciones disponibles en nuestra tienda para tu vehículo:'
                ),
                timestamp: new Date()
              };
              
              // Agregar mensaje con productos
              setChatHistory(prev => [...prev, productosMessage]);
            } else {
              // Si no encontramos productos, mostrar mensaje alternativo para contacto
              const mensajeAlternativo: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: `Parece que las refacciones específicas para tu ${selectedVehicle.make} ${selectedVehicle.model} ${selectedVehicle.year} no están disponibles en línea en este momento.

No te preocupes, puedes escribirnos directamente a través de nuestra página <a href="https://autologic.mx" target="_blank">autologic.mx</a> o enviarnos un mensaje por <a href="https://wa.me/5215512345678" target="_blank">WhatsApp</a> y con gusto te ayudaremos a conseguir las piezas que necesitas.`,
                timestamp: new Date()
              };
              
              setChatHistory(prev => [...prev, mensajeAlternativo]);
            }
          } catch (error) {
            console.error('Error al buscar productos:', error);
            
            // Mensaje de fallback si ocurre un error
            const errorMessage: ChatMessage = {
              id: uuidv4(),
              role: 'assistant',
              content: `Para conseguir las refacciones recomendadas para tu ${selectedVehicle.make} ${selectedVehicle.model}, te invito a visitar nuestra tienda en <a href="https://autologic.mx" target="_blank">autologic.mx</a> donde podrás encontrar todos nuestros productos.`,
              timestamp: new Date()
            };
            
            setChatHistory(prev => [...prev, errorMessage]);
          }
        }
      } catch (error) {
        console.error("Error al buscar productos en Shopify:", error);
      } finally {
        setIsLoading(false);
      }
      
      // No se envía al backend si ya detectamos un síntoma localmente
      return;
    }
    
    try {
      // Preparar datos para la solicitud
      const requestData = {
        vehicleInfo: selectedVehicle ? {
          year: selectedVehicle.year,
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          engine: selectedVehicle.engine
        } : undefined,
        obdCodes: obdCodes.length > 0 ? obdCodes : undefined,
        symptoms: symptoms.length > 0 ? symptoms : undefined,
        additionalInfo: additionalInfo ? additionalInfo : undefined,
        chatHistory: [...chatHistory, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };
      
      // Enviar solicitud al backend
      const response = await apiRequest('POST', '/api/diagnostics/analyze', requestData);
      const data = await response.json();
      
      if (data && data.chatHistory && data.chatHistory.length > 0) {
        // Actualizar historial de chat con la respuesta
        const newHistory = data.chatHistory.map((msg: any) => ({
          id: uuidv4(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date()
        }));
        
        setChatHistory(newHistory);
        
        // Si hay diagnóstico, actualizar estado
        if (data.diagnosis) {
          setDiagnosis(data.diagnosis);
          setSeverity(data.severity || 'media');
          setHasDiagnosis(true);
        }
      } else {
        // Si hay error en la respuesta
        const botMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta nuevamente.',
          timestamp: new Date()
        };
        
        setChatHistory([...chatHistory, userMessage, botMessage]);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      // Mensaje de error
      const botMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al comunicarse con el asistente. Por favor, verifica tu conexión e intenta nuevamente.',
        timestamp: new Date()
      };
      
      setChatHistory([...chatHistory, userMessage, botMessage]);
      
      toast({
        title: 'Error',
        description: 'No se pudo conectar con el asistente de diagnóstico.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Iniciar diagnóstico con los datos del formulario
  const startDiagnostic = async () => {
    // Validaciones
    if (!currentUser) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para utilizar el diagnóstico.',
        variant: 'destructive'
      });
      return;
    }
    
    if (obdCodes.length === 0 && symptoms.length === 0) {
      toast({
        title: 'Datos insuficientes',
        description: 'Ingresa al menos un código OBD o un síntoma para iniciar el diagnóstico.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    // Construir mensaje inicial
    let initialMessage = '';
    
    if (selectedVehicle) {
      initialMessage += `Vehículo: ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`;
      if (selectedVehicle.engine) {
        initialMessage += ` (${selectedVehicle.engine})`;
      }
      initialMessage += '\n';
    }
    
    if (obdCodes.length > 0) {
      initialMessage += `Códigos OBD: ${obdCodes.join(', ')}\n`;
    }
    
    if (symptoms.length > 0) {
      initialMessage += `Síntomas: ${symptoms.join(', ')}\n`;
    }
    
    if (additionalInfo) {
      initialMessage += `Información adicional: ${additionalInfo}\n`;
    }
    
    initialMessage += '\n¿Podrías diagnosticar mi vehículo con esta información?';
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: initialMessage,
      timestamp: new Date()
    };
    
    setChatHistory([userMessage]);
    
    try {
      // Preparar datos para la solicitud
      const requestData = {
        vehicleInfo: selectedVehicle ? {
          year: selectedVehicle.year,
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          engine: selectedVehicle.engine
        } : undefined,
        obdCodes: obdCodes.length > 0 ? obdCodes : undefined,
        symptoms: symptoms.length > 0 ? symptoms : undefined,
        additionalInfo: additionalInfo ? additionalInfo : undefined,
        chatHistory: [userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };
      
      // Enviar solicitud al backend
      const response = await apiRequest('POST', '/api/diagnostics/analyze', requestData);
      const data = await response.json();
      
      if (data && data.chatHistory && data.chatHistory.length > 0) {
        // Actualizar historial de chat con la respuesta
        const newHistory = data.chatHistory.map((msg: any) => ({
          id: uuidv4(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date()
        }));
        
        setChatHistory(newHistory);
        
        // Si hay diagnóstico, actualizar estado
        if (data.diagnosis) {
          setDiagnosis(data.diagnosis);
          setSeverity(data.severity || 'media');
          setHasDiagnosis(true);
        }
      } else {
        // Si hay error en la respuesta
        const botMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta nuevamente.',
          timestamp: new Date()
        };
        
        setChatHistory([userMessage, botMessage]);
      }
    } catch (error) {
      console.error('Error al iniciar diagnóstico:', error);
      
      // Mensaje de error
      const botMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al comunicarse con el asistente. Por favor, verifica tu conexión e intenta nuevamente.',
        timestamp: new Date()
      };
      
      setChatHistory([userMessage, botMessage]);
      
      toast({
        title: 'Error',
        description: 'No se pudo conectar con el asistente de diagnóstico.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Guardar diagnóstico
  const saveDiagnostic = async () => {
    if (!currentUser) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para guardar diagnósticos.',
        variant: 'destructive'
      });
      return;
    }
    
    if (chatHistory.length === 0) {
      toast({
        title: 'Diagnóstico vacío',
        description: 'No hay información de diagnóstico para guardar.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Preparar datos para guardar
      const diagnosticData = {
        vehicleId: selectedVehicle ? selectedVehicle.id : null,
        obdCodes: obdCodes.length > 0 ? obdCodes : null,
        symptoms: symptoms.length > 0 ? symptoms : null,
        additionalInfo: additionalInfo ? additionalInfo : null,
        chatHistory: chatHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        diagnosis: diagnosis || chatHistory.find(msg => msg.role === 'assistant')?.content || '',
        severity: severity || 'media'
      };
      
      // Guardar diagnóstico
      const response = await apiRequest('POST', '/api/diagnostics', diagnosticData);
      await response.json();
      
      toast({
        title: 'Diagnóstico guardado',
        description: 'Se ha guardado el diagnóstico correctamente.',
      });
      
      // Notificar si hay callback de guardado
      if (onDiagnosticSaved) {
        onDiagnosticSaved();
      }
      
      // Reiniciar para nuevo diagnóstico
      resetDiagnostic();
    } catch (error) {
      console.error('Error al guardar diagnóstico:', error);
      
      toast({
        title: 'Error',
        description: 'No se pudo guardar el diagnóstico. Por favor, intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generar PDF del diagnóstico
  const generarPDFReporte = () => {
    if (!selectedVehicle) {
      toast({
        title: 'Información incompleta',
        description: 'Se necesita información del vehículo para generar el reporte.',
        variant: 'destructive'
      });
      return;
    }

    if (!diagnosis && chatHistory.length === 0) {
      toast({
        title: 'Sin diagnóstico',
        description: 'Primero debes realizar un diagnóstico para generar el reporte.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Construir texto del diagnóstico
      let diagnosticoTexto = diagnosis;
      
      // Si no hay un diagnóstico explícito, usar el último mensaje del asistente
      if (!diagnosticoTexto) {
        // Filtrar mensajes del asistente y tomar el último
        const mensajesAsistente = chatHistory
          .filter(msg => msg.role === 'assistant')
          .map(msg => msg.content);
          
        if (mensajesAsistente.length > 0) {
          // Eliminar etiquetas HTML que puedan estar en el mensaje
          diagnosticoTexto = mensajesAsistente[mensajesAsistente.length - 1]
            .replace(/<[^>]*>/g, '');
        } else {
          diagnosticoTexto = 'No se generó un diagnóstico específico.';
        }
      }
      
      // Generar PDF profesional con el diagnóstico y productos recomendados
      generarPDFDiagnosticoProfesional(
        diagnosticoTexto,
        productosRecomendados,
        {
          marca: selectedVehicle.make,
          modelo: selectedVehicle.model,
          anio: selectedVehicle.year
        },
        false // No guardar en Firebase automáticamente, solo descarga
      );
      
      toast({
        title: 'PDF Generado',
        description: 'Se ha generado el reporte de diagnóstico con éxito.',
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF. Por favor intenta nuevamente.',
        variant: 'destructive'
      });
    }
  };
  
  // Reiniciar diagnóstico
  const resetDiagnostic = () => {
    setObdCodes([]);
    setSymptoms([]);
    setAdditionalInfo('');
    setChatHistory([]);
    setCurrentInput('');
    setNewItem('');
    setHasDiagnosis(false);
    setDiagnosis('');
    setSeverity('media');
    setProductosRecomendados([]);
  };
  
  // Genera el enlace del carrito con productos recomendados
  const getCartLink = () => {
    if (!productosRecomendados || productosRecomendados.length === 0) {
      return 'https://autologic.mx/cart';
    }

    const items = productosRecomendados
      .map(p => {
        // Extraer solo el número de ID de variante
        const variantId = p.variantId.split('/').pop() || '';
        return `${variantId}:1`;
      })
      .join(',');

    return `https://autologic.mx/cart/${items}`;
  };
  
  // Calcular si hay suficiente información para iniciar el diagnóstico
  const canStartDiagnostic = () => {
    return obdCodes.length > 0 || symptoms.length > 0;
  };
  
  // Tecla Enter para enviar mensaje
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Panel superior minimalista */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Info del vehículo */}
        {selectedVehicle && (
          <div className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs font-medium">
            <Car className="h-3 w-3 text-primary mr-1" />
            {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            {selectedVehicle.engine && ` (${selectedVehicle.engine})`}
          </div>
        )}
        
        {/* Selector de modo */}
        <div className="inline-flex items-center bg-muted rounded text-xs overflow-hidden">
          <button 
            className={`px-2 py-1 ${isOBDMode ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setIsOBDMode(true)}
          >
            Códigos OBD
          </button>
          <button 
            className={`px-2 py-1 ${!isOBDMode ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setIsOBDMode(false)}
          >
            Síntomas
          </button>
        </div>
        
        {/* Botón para ver contexto de OBi-2 */}
        <Button 
          variant="outline" 
          size="sm"
          className="h-7 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            toast({
              title: "Contexto de OBi-2",
              description: "Nivel de usuario: " + contextManager.contexto.nivelUsuario +
                          ", Vehículo: " + (selectedVehicle ? selectedVehicle.make + " " + selectedVehicle.model : "No seleccionado"),
              duration: 5000,
            });
          }}
        >
          <Info className="w-3 h-3 mr-1" /> OBi-2 Contexto
        </Button>
        
        {/* Botones de acción */}
        <div className="ml-auto inline-flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={resetDiagnostic}
            disabled={isLoading}
          >
            Reiniciar
          </Button>
          
          {/* Botones que aparecen cuando hay un diagnóstico */}
          {hasDiagnosis && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={saveDiagnostic}
                disabled={isLoading}
              >
                <Save className="h-3 w-3 mr-1" />
                Guardar
              </Button>
              
              {/* Botón para generar PDF */}
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={generarPDFReporte}
                disabled={isLoading}
              >
                <FileDown className="h-3 w-3 mr-1" />
                PDF
              </Button>
              
              {/* Botón para ir al carrito (solo si hay productos recomendados) */}
              {productosRecomendados.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={getCartLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Carrito
                        </Button>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Agregar todas las refacciones al carrito de Shopify</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Formulario de entrada simplificado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        {/* Entrada de códigos o síntomas */}
        <div className="col-span-2">
          <div className="flex gap-2 mb-2">
            <Input
              placeholder={isOBDMode ? "Ej: P0300" : "Ej: El motor no arranca"}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="h-8 text-sm"
            />
            <Button
              onClick={isOBDMode ? addOBDCode : addSymptom}
              size="icon"
              className="h-8 w-8"
              disabled={!newItem.trim()}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Lista de códigos/síntomas */}
          <div className="flex flex-wrap gap-1 min-h-[28px]">
            {isOBDMode
              ? obdCodes.map((code) => (
                <Badge key={code} variant="secondary" className="h-6 text-xs flex items-center gap-1">
                  {code}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeOBDCode(code)}
                  />
                </Badge>
              ))
              : symptoms.map((symptom) => (
                <Badge key={symptom} variant="secondary" className="h-6 text-xs flex items-center gap-1">
                  {symptom.length > 25 ? symptom.substring(0, 22) + '...' : symptom}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSymptom(symptom)}
                  />
                </Badge>
              ))}
          </div>
        </div>
        
        {/* Panel de sugerencias */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                Sugerencias comunes
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="text-xs font-medium mb-1">
                {isOBDMode ? 'Códigos OBD comunes' : 'Síntomas comunes'}
              </div>
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {isOBDMode
                  ? commonOBDCodes.map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center hover:bg-muted p-1 rounded cursor-pointer text-xs"
                      onClick={() => {
                        if (!obdCodes.includes(item.code)) {
                          setObdCodes([...obdCodes, item.code]);
                        }
                      }}
                    >
                      <Badge variant="outline" className="text-[10px] h-5">{item.code}</Badge>
                      <span className="text-xs text-muted-foreground flex-1 ml-2 truncate">
                        {item.description}
                      </span>
                    </div>
                  ))
                  : commonSymptoms.map((symptom) => (
                    <div
                      key={symptom}
                      className="hover:bg-muted p-1 rounded cursor-pointer text-xs"
                      onClick={() => {
                        if (!symptoms.includes(symptom)) {
                          setSymptoms([...symptoms, symptom]);
                        }
                      }}
                    >
                      {symptom}
                    </div>
                  ))}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Info adicional */}
          <Textarea
            placeholder="Información adicional (opcional)"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="resize-none h-[50px] text-xs mt-2"
          />
        </div>
      </div>
      
      {/* Botón iniciar diagnóstico */}
      <Button
        size="sm"
        className="mb-3"
        onClick={startDiagnostic}
        disabled={isLoading || !canStartDiagnostic() || chatHistory.length > 0}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <SendHorizontal className="h-4 w-4 mr-1" />
        )}
        Iniciar diagnóstico
      </Button>
      
      <Separator className="mb-3" />
      
      {/* Chat de diagnóstico simplificado */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {chatHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-4">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <div>
              <h3 className="text-base font-medium mb-1">Asistente de diagnóstico</h3>
              <p className="text-xs text-muted-foreground">
                Ingresa códigos OBD o síntomas para iniciar un diagnóstico
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3 py-2">
                {chatHistory.map((message) => {
                  // Si es un mensaje del asistente y no contiene ya la personalización, aplicarla
                  let displayContent = message.content;
                  
                  // Aplicar personalidad a mensajes del asistente si no tienen ya el prefijo de OBi-2
                  if (message.role === 'assistant' && 
                      !message.content.includes('OBi-2 dice:') && 
                      !message.content.includes('Refacciones recomendadas')) {
                    displayContent = generarRespuestaContextual(message.content);
                  }
                  
                  return (
                    <div 
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start gap-2 max-w-[85%]">
                        {message.role === 'assistant' && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">OBi</AvatarFallback>
                          </Avatar>
                        )}
                      
                      <div className={`px-3 py-2 rounded-lg text-xs ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {message.role === 'assistant' && displayContent.includes('Refacciones recomendadas') ? (
                          <div>
                            {/* Formatear mensajes que contienen recomendaciones */}
                            {displayContent.split('\n\n').map((paragraph, idx) => {
                              if (paragraph.includes('Basado en tu descripción')) {
                                // Título del diagnóstico
                                return (
                                  <div key={idx} className="mb-2 font-medium">
                                    {paragraph.replace(/\*\*/g, '')}
                                  </div>
                                );
                              } else if (paragraph.includes('Refacciones recomendadas')) {
                                // Sección de refacciones
                                const [title, ...items] = paragraph.split('\n');
                                return (
                                  <div key={idx} className="mb-2">
                                    <div className="font-bold mb-1">{title.replace(/\*\*/g, '')}</div>
                                    <ul className="pl-1 space-y-1 mb-2">
                                      {items.map((item, itemIdx) => (
                                        <li key={itemIdx} className="flex items-start">
                                          <span className="text-green-500 mr-1">{item.slice(0, 1)}</span>
                                          <span className="text-zinc-800 dark:text-zinc-200">{item.slice(2)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              } else {
                                // Otros párrafos
                                return (
                                  <div key={idx} className="whitespace-pre-wrap mb-2">
                                    {paragraph}
                                  </div>
                                );
                              }
                            })}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {displayContent}
                          </div>
                        )}
                      </div>
                      
                      {message.role === 'user' && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">OBi</AvatarFallback>
                      </Avatar>
                      
                      <div className="px-3 py-2 rounded-lg bg-muted">
                        <div className="flex items-center gap-1">
                          <div className="animate-bounce h-1.5 w-1.5 bg-primary rounded-full" />
                          <div className="animate-bounce h-1.5 w-1.5 bg-primary rounded-full" style={{ animationDelay: '0.2s' }} />
                          <div className="animate-bounce h-1.5 w-1.5 bg-primary rounded-full" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            
            {hasDiagnosis && (
              <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-xs flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                <span className="flex-1">Diagnóstico completo</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={saveDiagnostic}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Guardar
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                placeholder="Escribe un mensaje..."
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="text-sm"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || (!currentInput.trim() && chatHistory.length > 0)}
                size="icon"
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Botones de acciones rápidas */}
            <div id="acciones-rapidas" className="mt-4 p-3 border rounded-md bg-muted/50">
              <p className="text-sm font-medium mb-2">¿Qué problema tiene tu coche?</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => responderDesdeBoton('no_arranca')}
                  className="text-xs"
                >
                  No arranca
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => responderDesdeBoton('huele_quemado')}
                  className="text-xs"
                >
                  Huele a quemado
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => responderDesdeBoton('se_jalonea')}
                  className="text-xs"
                >
                  Se jalonea
                </Button>
              </div>
              
              {/* Mostrar nivel técnico actual */}
              {nivelUsuario !== "desconocido" && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <span>Nivel técnico: </span>
                  <Badge variant={
                    nivelUsuario === "novato" ? "outline" : 
                    nivelUsuario === "intermedio" ? "secondary" : 
                    "default"
                  }>{nivelUsuario}</Badge>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-xs p-0 pl-2 h-auto" 
                    onClick={() => {
                      setNivelUsuario("desconocido");
                      localStorage.removeItem("nivelUsuario");
                      toast({
                        title: "Nivel restablecido",
                        description: "Se ha restablecido tu nivel técnico.",
                      });
                    }}
                  >
                    Restablecer
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsChat;