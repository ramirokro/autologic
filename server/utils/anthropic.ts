import OpenAI from 'openai';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o'; // El modelo más reciente de OpenAI es "gpt-4o" que fue lanzado en mayo de 2024

// Sistema prompt para el diagnóstico automotriz
const SYSTEM_PROMPT = `Eres un mecánico automotriz experto con más de 30 años de experiencia en diagnóstico y reparación de vehículos de todas las marcas.
Tu nombre es "AutoLogic" y representas un avanzado sistema de diagnóstico automotriz basado en IA.

Tu objetivo es proporcionar un diagnóstico preciso basado en:
1. Códigos OBD-II proporcionados
2. Síntomas descritos por el usuario
3. Información específica del vehículo (año, marca, modelo, motor)
4. Información adicional o contexto proporcionado

Estructura tu respuesta siguiendo estos pasos:

1. ANÁLISIS INICIAL:
   - Resume brevemente el problema presentado por el usuario
   - Explica el significado de los códigos OBD-II mencionados (si se proporcionan)
   - Relaciona los síntomas con posibles causas según el modelo específico

2. DIAGNÓSTICO DETALLADO:
   - Proporciona un diagnóstico completo basado en toda la información
   - Considera las fallas comunes conocidas para el modelo y año específico del vehículo
   - Menciona las posibles causas ordenadas por probabilidad (de más a menos probable)
   - Incluye análisis de componentes específicos que podrían estar fallando

3. RECOMENDACIONES DE ACCIÓN:
   - Indica claramente qué debe hacer el usuario para resolver el problema
   - Sugiere pruebas adicionales específicas si son necesarias
   - Recomienda piezas o componentes específicos que podrían necesitar reemplazo
   - Incluye consejos de mantenimiento preventivo relacionados con el problema

4. SEVERIDAD Y URGENCIA:
   - Clasifica explícitamente la severidad como: "BAJA" (no urgente), "MEDIA" (requiere atención pronto), o "ALTA" (peligroso, atención inmediata)
   - Explica las posibles consecuencias de no atender el problema
   - Menciona si es seguro seguir conduciendo el vehículo o no

5. PIEZAS RECOMENDADAS:
   - Enumera las posibles piezas o componentes que podrían necesitar reemplazo
   - Incluye, cuando sea posible, nombres genéricos y específicos de las piezas
   - Menciona categorías de piezas (ej: "filtro de aire", "sensor de oxígeno", etc.)

Utiliza un tono profesional pero accesible, evitando jerga técnica excesiva. Explica términos técnicos cuando sea necesario. Si no tienes suficiente información para un diagnóstico confiable, solicita específicamente los detalles adicionales que necesitas.

IMPORTANTE: Tus recomendaciones deben ser seguras y responsables. Si el problema representa un riesgo de seguridad, enfatiza la necesidad de atención profesional inmediata.`;

// Lista de categorías de piezas para mapear con productos
const PART_CATEGORIES = [
  "filtro de aire", "filtro de aceite", "filtro de combustible", "filtro de habitáculo",
  "bujía", "cable de bujía", "bobina de encendido", 
  "sensor de oxígeno", "sensor MAF", "sensor MAP", "sensor de posición del cigüeñal", "sensor de temperatura",
  "bomba de combustible", "inyector de combustible", "regulador de presión",
  "alternador", "motor de arranque", "batería", "cable de batería",
  "pastilla de freno", "disco de freno", "calibrador de freno", "líquido de frenos",
  "amortiguador", "resorte", "barra estabilizadora",
  "correa de distribución", "correa serpentina", "tensor de correa",
  "termostato", "radiador", "bomba de agua", "manguera de radiador",
  "embrague", "volante motor", "caja de cambios", "aceite de transmisión",
  "junta de culata", "empaque", "sello", "anillo de pistón",
  "catalizador", "silenciador", "tubo de escape", "sensor EGR",
  "aceite de motor", "líquido refrigerante", "líquido de dirección", "líquido limpiaparabrisas"
];

/**
 * Extrae las piezas recomendadas del texto de diagnóstico
 * 
 * @param diagnosisText Texto del diagnóstico
 * @returns Array de categorías de piezas recomendadas
 */
function extractRecommendedParts(diagnosisText: string): string[] {
  // Normalizar el texto para la búsqueda
  const normalizedText = diagnosisText.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Eliminar acentos
  
  // Buscar palabras clave de piezas en el texto
  const foundParts: string[] = [];
  
  // Patrones específicos en secciones de recomendación o piezas
  const sectionPatterns = [
    /piezas\s+recomendadas[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is,
    /componentes\s+a\s+reemplazar[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is,
    /se\s+recomienda\s+reemplazar[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is,
    /necesitarás[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is
  ];
  
  // Intentar extraer de secciones específicas primero
  for (const pattern of sectionPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const sectionText = match[1].toLowerCase();
      
      // Buscar cada categoría de pieza en esta sección
      for (const part of PART_CATEGORIES) {
        const normalizedPart = part.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (sectionText.includes(normalizedPart) && !foundParts.includes(part)) {
          foundParts.push(part);
        }
      }
      
      // Si encontramos piezas en una sección específica, podemos priorizar estas
      if (foundParts.length > 0) {
        return foundParts;
      }
    }
  }
  
  // Si no encontramos piezas en secciones específicas, buscar en todo el texto
  for (const part of PART_CATEGORIES) {
    const normalizedPart = part.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (normalizedText.includes(normalizedPart) && !foundParts.includes(part)) {
      foundParts.push(part);
    }
  }
  
  return foundParts;
}

function extractSeverity(diagnosisText: string): string {
    const normalizedText = diagnosisText.toLowerCase();
    const severityPatterns = [
      { pattern: /severidad:\s*alta|severidad\s+alta|prioridad:\s*alta|prioridad\s+alta|urgente|peligroso|inmediata|crítico/i, value: "alta" },
      { pattern: /severidad:\s*baja|severidad\s+baja|prioridad:\s*baja|prioridad\s+baja|no\s+urgente|menor|leve/i, value: "baja" },
      { pattern: /severidad:\s*media|severidad\s+media|prioridad:\s*media|prioridad\s+media|moderado|atención\s+pronto/i, value: "media" }
    ];
  
    for (const { pattern, value } of severityPatterns) {
      if (pattern.test(normalizedText)) {
        return value;
      }
    }
    return "media"; // Valor predeterminado
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
    const messages: any[] = chatHistory || [];

    if (!chatHistory || chatHistory.length === 0) {
      let initialPrompt = "";
      
      // Agregar información del vehículo si está disponible
      if (vehicleInfo) {
        initialPrompt += "Información del vehículo:\n";
        if (vehicleInfo.year) initialPrompt += `- Año: ${vehicleInfo.year}\n`;
        if (vehicleInfo.make) initialPrompt += `- Marca: ${vehicleInfo.make}\n`;
        if (vehicleInfo.model) initialPrompt += `- Modelo: ${vehicleInfo.model}\n`;
        if (vehicleInfo.engine) initialPrompt += `- Motor: ${vehicleInfo.engine}\n`;
        initialPrompt += "\n";
      }
      
      // Agregar códigos OBD si están disponibles
      if (obdCodes && obdCodes.length > 0) {
        initialPrompt += `Códigos OBD detectados: ${obdCodes.join(", ")}\n\n`;
      }
      
      // Agregar síntomas si están disponibles
      if (symptoms && symptoms.length > 0) {
        initialPrompt += "Síntomas reportados:\n";
        symptoms.forEach((symptom, index) => {
          initialPrompt += `${index + 1}. ${symptom}\n`;
        });
        initialPrompt += "\n";
      }
      
      // Agregar información adicional si está disponible
      if (additionalInfo) {
        initialPrompt += `Información adicional: ${additionalInfo}\n\n`;
      }
      
      // Finalizar el prompt con la solicitud de diagnóstico
      initialPrompt += "Por favor, proporciona un diagnóstico detallado basado en esta información.";
      
      messages.push({
        role: "user",
        content: initialPrompt
      });
    }
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: messages,
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    const assistantResponse = response.choices[0].message.content || 
      'No se pudo generar un diagnóstico. Por favor, intenta de nuevo con más información.';
    
    const updatedChatHistory = [
      ...messages,
      {
        role: "assistant",
        content: assistantResponse
      }
    ];
    
    const recommendedParts = extractRecommendedParts(assistantResponse);
    const severity = extractSeverity(assistantResponse);

    return {
      chatHistory: updatedChatHistory,
      diagnosis: assistantResponse,
      severity,
      recommendedParts
    };
  } catch (error) {
    console.error("Error en el diagnóstico:", error);
    throw new Error("No se pudo completar el diagnóstico. Por favor, intenta nuevamente.");
  }
}