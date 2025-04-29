import Anthropic from '@anthropic-ai/sdk';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// Inicializar el cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// El modelo más reciente de Anthropic
export const MODEL = 'claude-3-7-sonnet-20250219';

// Sistema prompt para el diagnóstico automotriz
// Importar la configuración de la tienda Shopify
import { SHOPIFY_DOMAIN } from './shopify';

export const SYSTEM_PROMPT = `Eres OBi-2, un mecánico virtual comprensivo y paciente con más de 30 años de experiencia, como ese amigo experimentado que todos queremos tener para ayudarnos cuando nuestro auto tiene problemas.

PERSONALIDAD FUNDAMENTAL:
- Eres como un mentor compasivo para jóvenes adultos que enfrentan su primera avería mecánica.
- Te expresas de forma simple y accesible, como cuando explicas algo a un amigo sin experiencia técnica.
- Tu tono es tranquilizador, nunca alarmante ni condescendiente.
- Entiendes el valor emocional que un auto tiene para su dueño, especialmente para jóvenes en su primer vehículo.
- Sabes que las personas pueden estar preocupadas o asustadas cuando su auto falla.

ESTILO COMUNICATIVO:
- Usa emoji 🛠️ al inicio de tus respuestas.
- Siempre comienza con "🛠️ **OBi-2 dice:**" seguido de algo reconfortante como "¡Tranquilo! Estoy aquí para ayudarte" o "No te preocupes, vamos a resolver esto juntos".
- Evita términos técnicos complicados; si usas alguno, explícalo inmediatamente.
- Usa metáforas sencillas cuando expliques problemas complejos.
- Menciona siempre que estas situaciones son normales y tienen solución.
- Ofrece ánimo y apoyo emocional.

ESTRUCTURA DE RESPUESTA:
1. Breve introducción tranquilizadora
2. Resumen conciso del problema (no más de 2-3 oraciones)
3. SIEMPRE TERMINA TU RESPUESTA con una sección de "**Refacciones recomendadas:**" que liste las partes específicas que se necesitan para reparar el problema
4. Nunca des información adicional después de la sección de refacciones recomendadas
5. Limita tus explicaciones técnicas y diagnósticos para centrarte en las soluciones tangibles y partes que necesitan ser reemplazadas

IMPORTANTE SOBRE LA TIENDA ONLINE: 
- Todas las refacciones están disponibles en nuestra tienda online: https://${SHOPIFY_DOMAIN}
- NO MENCIONES ninguna otra tienda o sitio web como obi2autopartes.com
- Si el usuario pregunta dónde comprar las refacciones, menciona "Puedes encontrar todas estas refacciones en nuestra tienda en línea: https://${SHOPIFY_DOMAIN}"
- ES OBLIGATORIO que incluyas enlaces directos a las categorías de productos relevantes para cada refacción
- NUNCA recomiendes ir a un taller mecánico; siempre sugiere que el usuario compre las refacciones en nuestra tienda online

LINKS DIRECTOS A PRODUCTOS:
- Para baterías: https://${SHOPIFY_DOMAIN}/collections/baterias
- Para alternadores: https://${SHOPIFY_DOMAIN}/collections/alternadores
- Para filtros de aire: https://${SHOPIFY_DOMAIN}/collections/filtros
- Para bujías: https://${SHOPIFY_DOMAIN}/collections/bujias
- Para frenos: https://${SHOPIFY_DOMAIN}/collections/frenos
- Para aceites: https://${SHOPIFY_DOMAIN}/collections/aceites
- Para la tienda general: https://${SHOPIFY_DOMAIN}/collections/all

ESTRUCTURA DE RESPUESTAS REFINADA:
1. Saludo amigable y tranquilizador con "🛠️ **OBi-2 dice:**"
2. Breve explicación amigable del problema (2-3 oraciones máximo)
3. Lista muy corta de posibles causas en términos simples
4. **Refacciones recomendadas:** (esta sección SIEMPRE debe ser la última parte de tu respuesta)
   • [Alternador marca XXX](https://${SHOPIFY_DOMAIN}/collections/alternadores)
   • [Batería marca YYY](https://${SHOPIFY_DOMAIN}/collections/baterias)
   • Etc.

Recuerda: SIEMPRE TERMINA con la sección de refacciones recomendadas incluyendo enlaces directos a las categorías. Usa el formato de Markdown para los enlaces: [Nombre del producto](URL).

Recuerda que tu propósito es hacer que la experiencia de tener un auto sea lo más simple y positiva posible, incluso cuando surgen problemas.`;

/**
 * Extrae la severidad del texto de diagnóstico
 * @param diagnosisText Texto del diagnóstico
 * @returns Nivel de severidad (alta, media, baja)
 */
export function extractSeverity(diagnosisText: string): string {
  const normalizedText = diagnosisText.toLowerCase();
  if (normalizedText.includes('severidad: alta') || 
      normalizedText.includes('urgente') || 
      normalizedText.includes('peligroso') || 
      normalizedText.includes('inmediata') || 
      normalizedText.includes('crítico')) {
    return "alta";
  } else if (normalizedText.includes('severidad: baja') || 
            normalizedText.includes('no urgente') || 
            normalizedText.includes('menor') || 
            normalizedText.includes('leve')) {
    return "baja";
  } else {
    return "media"; // Valor predeterminado
  }
}

/**
 * Analiza información de diagnóstico y utiliza Claude para generar un diagnóstico completo
 */
export async function analyzeVehicleHealth(
  vehicleData: {
    make: string;
    model: string;
    year: number;
    engine?: string;
  },
  symptoms: string[],
  maintenanceHistory: { service: string; date: string; mileage: number }[] = [],
  mileage: number,
  additionalInfo?: string
): Promise<any> {
  try {
    let userPrompt = "";
    
    // Agregar información del vehículo
    userPrompt += "Información del vehículo:\n";
    userPrompt += `- Marca: ${vehicleData.make}\n`;
    userPrompt += `- Modelo: ${vehicleData.model}\n`;
    userPrompt += `- Año: ${vehicleData.year}\n`;
    if (vehicleData.engine) userPrompt += `- Motor: ${vehicleData.engine}\n`;
    userPrompt += `- Kilometraje actual: ${mileage} km\n\n`;
    
    // Agregar síntomas
    if (symptoms && symptoms.length > 0) {
      userPrompt += "Síntomas reportados:\n";
      symptoms.forEach((symptom, index) => {
        userPrompt += `${index + 1}. ${symptom}\n`;
      });
      userPrompt += "\n";
    }
    
    // Agregar historial de mantenimiento
    if (maintenanceHistory && maintenanceHistory.length > 0) {
      userPrompt += "Historial de mantenimiento:\n";
      maintenanceHistory.forEach((service, index) => {
        userPrompt += `${index + 1}. ${service.service} - Fecha: ${service.date} - Kilometraje: ${service.mileage} km\n`;
      });
      userPrompt += "\n";
    }
    
    // Agregar información adicional
    if (additionalInfo) {
      userPrompt += `Información adicional: ${additionalInfo}\n\n`;
    }
    
    userPrompt += "Por favor, proporciona un análisis completo de la salud del vehículo basado en esta información, incluyendo un nivel de urgencia (ALTA, MEDIA, BAJA) y un puntaje de salud del 1 al 100.";
    
    // Crear mensaje para Anthropic
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }]
    });
    
    let assistantResponse = "";
    
    // Extraer el texto de la respuesta
    if (message.content && message.content[0] && message.content[0].type === 'text') {
      assistantResponse = message.content[0].text;
    } else {
      assistantResponse = "Lo siento, no pude generar una respuesta adecuada.";
    }
    
    // Extraer nivel de urgencia (ALTA, MEDIA, BAJA)
    let urgencyLevel = "MEDIA"; // Valor predeterminado
    if (assistantResponse.includes("ALTA")) {
      urgencyLevel = "ALTA";
    } else if (assistantResponse.includes("BAJA")) {
      urgencyLevel = "BAJA";
    }
    
    // Generar un puntaje de salud (simplificado)
    let healthScore = 50; // Valor predeterminado
    if (urgencyLevel === "ALTA") {
      healthScore = Math.floor(Math.random() * 30) + 10; // 10-40
    } else if (urgencyLevel === "MEDIA") {
      healthScore = Math.floor(Math.random() * 30) + 40; // 40-70
    } else {
      healthScore = Math.floor(Math.random() * 30) + 70; // 70-100
    }
    
    return {
      analysis: assistantResponse,
      urgencyLevel,
      healthScore
    };
  } catch (error) {
    console.error("Error en el análisis de salud del vehículo:", error);
    throw new Error("No se pudo completar el análisis. Por favor, intenta nuevamente.");
  }
}

export async function analyzeDiagnostic(
  vehicleInfo?: {
    year?: number;
    make?: string;
    model?: string;
    engine?: string;
  },
  obdCodes?: string[],
  symptoms?: string[],
  additionalInfo?: string,
  chatHistory?: ChatMessage[]
): Promise<{ chatHistory: ChatMessage[]; diagnosis: string; severity: string; recommendedParts: string[] }> {
  try {
    let userPrompt = "";
    
    // Agregar información del vehículo si está disponible
    if (vehicleInfo) {
      userPrompt += "Información del vehículo:\n";
      if (vehicleInfo.year) userPrompt += `- Año: ${vehicleInfo.year}\n`;
      if (vehicleInfo.make) userPrompt += `- Marca: ${vehicleInfo.make}\n`;
      if (vehicleInfo.model) userPrompt += `- Modelo: ${vehicleInfo.model}\n`;
      if (vehicleInfo.engine) userPrompt += `- Motor: ${vehicleInfo.engine}\n`;
      userPrompt += "\n";
    }
    
    // Agregar códigos OBD si están disponibles
    if (obdCodes && obdCodes.length > 0) {
      userPrompt += `Códigos OBD detectados: ${obdCodes.join(", ")}\n\n`;
    }
    
    // Agregar síntomas si están disponibles
    if (symptoms && symptoms.length > 0) {
      userPrompt += "Síntomas reportados:\n";
      symptoms.forEach((symptom, index) => {
        userPrompt += `${index + 1}. ${symptom}\n`;
      });
      userPrompt += "\n";
    }
    
    // Agregar información adicional si está disponible
    if (additionalInfo) {
      userPrompt += `Información adicional: ${additionalInfo}\n\n`;
    }
    
    // Si no hay nada específico, usar un mensaje genérico
    if (!vehicleInfo && (!obdCodes || obdCodes.length === 0) && 
        (!symptoms || symptoms.length === 0) && !additionalInfo) {
      userPrompt = "Necesito ayuda con mi diagnóstico automotriz.";
    }
    
    // Agregar instrucción para dar personalidad
    userPrompt += "\n\nRecuerda que estás hablando con alguien que podría ser un joven que acaba de recibir su primer auto, está preocupado porque no arranca, y no tiene experiencia con mecánica. Sé tranquilizador, cercano y usa lenguaje simple. Haz sentir que todo estará bien y que este problema tiene solución.";
    
    // Crear mensaje para Anthropic
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      temperature: 0.7, // Aumentamos más la temperatura para una personalidad más viva
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }]
    });
    
    let assistantResponse = "";
    
    // Extraer el texto de la respuesta
    if (message.content && message.content[0] && message.content[0].type === 'text') {
      assistantResponse = message.content[0].text;
    } else {
      assistantResponse = "Lo siento, no pude generar una respuesta adecuada.";
    }
    
    // Crear o actualizar el historial de chat
    const newChatHistory: ChatMessage[] = chatHistory || [];
    newChatHistory.push({ role: "user", content: userPrompt });
    newChatHistory.push({ role: "assistant", content: assistantResponse });
    
    // Determinar severidad
    const severity = extractSeverity(assistantResponse);
    
    return {
      chatHistory: newChatHistory,
      diagnosis: assistantResponse,
      severity,
      recommendedParts: [] // Por simplicidad, dejamos vacío el array de piezas recomendadas
    };
  } catch (error) {
    console.error("Error en el diagnóstico con Anthropic:", error);
    throw new Error("No se pudo completar el diagnóstico. Por favor, intenta nuevamente.");
  }
}