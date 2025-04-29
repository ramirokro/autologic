/**
 * ContextManager para OBi-2
 * 
 * Gestiona el contexto de conversación para adaptar las respuestas de OBi-2
 * según el nivel del usuario, su vehículo y otros factores contextuales.
 */

// Tipos de nivel de usuario
export type NivelUsuario = 'novato' | 'intermedio' | 'experto';

// Interfaz para la información contextual del vehículo
export interface VehiculoContexto {
  make: string;
  model: string;
  year: number;
  engine?: string;
  transmission?: string;
  mileage?: number;
}

// Interfaz principal para el contexto de OBi-2
export interface ContextoOBi {
  nivelUsuario: NivelUsuario;
  vehiculo?: VehiculoContexto;
  ultimaPregunta?: string;
  topicosDiscutidos: string[];
  ultimaIntencion?: string;
  diagnosticos: string[];
  refaccionesSugeridas: string[];
}

// Clase para la gestión del contexto
class ContextManager {
  contexto: ContextoOBi = {
    nivelUsuario: 'intermedio', // Por defecto asumimos nivel intermedio
    topicosDiscutidos: [],
    diagnosticos: [],
    refaccionesSugeridas: []
  };

  /**
   * Actualiza el nivel de usuario detectado
   */
  actualizarNivelUsuario(nivel: NivelUsuario): void {
    this.contexto.nivelUsuario = nivel;
    console.log(`ContextManager - Nivel de usuario actualizado: ${nivel}`);
  }

  /**
   * Actualiza la información del vehículo en contexto
   * @param vehiculo Información del vehículo
   */
  actualizarVehiculo(vehiculo: VehiculoContexto): void {
    this.contexto.vehiculo = vehiculo;
    console.log(`ContextManager - Vehículo actualizado: ${vehiculo.year} ${vehiculo.make} ${vehiculo.model}`);
  }

  /**
   * Registra un nuevo tópico discutido en la conversación
   */
  agregarTopico(topico: string): void {
    if (!this.contexto.topicosDiscutidos.includes(topico)) {
      this.contexto.topicosDiscutidos.push(topico);
      console.log(`ContextManager - Nuevo tópico registrado: ${topico}`);
    }
  }

  /**
   * Registra la última pregunta realizada
   */
  registrarPregunta(pregunta: string): void {
    this.contexto.ultimaPregunta = pregunta;
  }
  
  /**
   * Actualiza la última intención detectada
   */
  actualizarIntencion(intencion: string): void {
    this.contexto.ultimaIntencion = intencion;
    console.log(`ContextManager - Intención actualizada: ${intencion}`);
  }
  
  /**
   * Registra un diagnóstico identificado
   */
  agregarDiagnostico(diagnostico: string): void {
    if (!this.contexto.diagnosticos.includes(diagnostico)) {
      this.contexto.diagnosticos.push(diagnostico);
      console.log(`ContextManager - Nuevo diagnóstico registrado: ${diagnostico}`);
    }
  }
  
  /**
   * Registra una refacción sugerida
   */
  agregarRefaccion(refaccion: string): void {
    if (!this.contexto.refaccionesSugeridas.includes(refaccion)) {
      this.contexto.refaccionesSugeridas.push(refaccion);
      console.log(`ContextManager - Nueva refacción sugerida: ${refaccion}`);
    }
  }

  /**
   * Genera un resumen HTML del contexto actual
   */
  generarResumen(): string {
    let resumen = '<div style="font-family: monospace; padding: 10px; background: #f3f3f3; border-radius: 4px;">';
    
    // Nivel de usuario
    resumen += `<div><strong>Nivel de usuario:</strong> ${this.contexto.nivelUsuario}</div>`;
    
    // Vehículo
    if (this.contexto.vehiculo) {
      const v = this.contexto.vehiculo;
      resumen += `<div><strong>Vehículo:</strong> ${v.year} ${v.make} ${v.model}`;
      if (v.engine) resumen += ` (${v.engine})`;
      resumen += '</div>';
      
      if (v.mileage) {
        resumen += `<div><strong>Kilometraje:</strong> ${v.mileage.toLocaleString()} km</div>`;
      }
    } else {
      resumen += '<div><strong>Vehículo:</strong> No especificado</div>';
    }
    
    // Tópicos discutidos
    if (this.contexto.topicosDiscutidos.length > 0) {
      resumen += `<div><strong>Tópicos discutidos:</strong></div>`;
      resumen += '<ul>';
      this.contexto.topicosDiscutidos.forEach(topico => {
        resumen += `<li>${topico}</li>`;
      });
      resumen += '</ul>';
    }
    
    // Intención actual
    if (this.contexto.ultimaIntencion) {
      resumen += `<div><strong>Intención actual:</strong> ${this.contexto.ultimaIntencion}</div>`;
    }
    
    // Diagnósticos
    if (this.contexto.diagnosticos.length > 0) {
      resumen += `<div><strong>Diagnósticos:</strong></div>`;
      resumen += '<ul>';
      this.contexto.diagnosticos.forEach(diagnostico => {
        resumen += `<li>${diagnostico}</li>`;
      });
      resumen += '</ul>';
    }
    
    // Refacciones sugeridas
    if (this.contexto.refaccionesSugeridas.length > 0) {
      resumen += `<div><strong>Refacciones sugeridas:</strong></div>`;
      resumen += '<ul>';
      this.contexto.refaccionesSugeridas.forEach(refaccion => {
        resumen += `<li>${refaccion}</li>`;
      });
      resumen += '</ul>';
    }
    
    resumen += '</div>';
    return resumen;
  }

  /**
   * Adapta la respuesta del modelo según el contexto
   */
  adaptarRespuesta(respuestaOriginal: string): string {
    // Por ahora solo adaptamos el saludo según el nivel
    switch(this.contexto.nivelUsuario) {
      case 'novato':
        return respuestaOriginal.replace('Hola', 'Hola, no te preocupes');
      case 'experto':
        return respuestaOriginal.replace('Hola', 'Saludos, técnico');
      default:
        return respuestaOriginal;
    }
  }
  
  /**
   * Extrae posibles diagnósticos del texto de respuesta de OBi-2
   */
  extraerDiagnosticos(texto: string): void {
    // Patrones para identificar diagnósticos comunes
    const patronesDiagnostico = [
      /problema con (?:el|la) (.*?)(?:\.|\,|\n)/gi,
      /falla (?:en|del|de la) (.*?)(?:\.|\,|\n)/gi,
      /(?:el|la) (.*?) (?:está dañad[oa]|defectuos[oa]|falla)/gi,
      /reemplazar (?:el|la) (.*?)(?:\.|\,|\n)/gi
    ];
    
    // Buscar coincidencias en el texto
    patronesDiagnostico.forEach(patron => {
      const matches = texto.matchAll(patron);
      for (const match of matches) {
        if (match[1]) {
          this.agregarDiagnostico(match[1].trim());
        }
      }
    });
  }
  
  /**
   * Extrae refacciones sugeridas del texto de respuesta de OBi-2
   */
  extraerRefacciones(texto: string): void {
    // Buscar sección de refacciones recomendadas
    const patronRefacciones = /Refacciones recomendadas:?([\s\S]*?)(?:\n\n|$)/i;
    const match = texto.match(patronRefacciones);
    
    if (match && match[1]) {
      // Extraer cada refacción (tipicamente en formato lista con •)
      const lineas = match[1].split('\n');
      lineas.forEach(linea => {
        // Limpiar la línea de marcadores de lista y otros caracteres
        const refaccion = linea.replace(/^[•\-\*]\s*/, '').trim();
        if (refaccion) {
          this.agregarRefaccion(refaccion);
        }
      });
    }
  }
  
  /**
   * Analiza el texto de respuesta para actualizar el contexto
   */
  procesarRespuesta(respuesta: string): void {
    // Extraer diagnósticos
    this.extraerDiagnosticos(respuesta);
    
    // Extraer refacciones
    this.extraerRefacciones(respuesta);
    
    // Detectar intención basada en el contenido
    if (respuesta.includes('refacciones recomendadas') || 
        respuesta.includes('piezas sugeridas')) {
      this.actualizarIntencion('buscar_producto');
    }
  }
  
  /**
   * Verifica si debe buscar productos al final de la conversación
   */
  debeOfrecerProductos(): boolean {
    return (
      (this.contexto.ultimaIntencion === 'buscar_producto' || 
       this.contexto.refaccionesSugeridas.length > 0) && 
      !!this.contexto.vehiculo
    );
  }
  
  /**
   * Obtiene la lista de refacciones a buscar en Shopify
   */
  obtenerRefaccionesBusqueda(): string[] {
    return this.contexto.refaccionesSugeridas.length > 0 ? 
      this.contexto.refaccionesSugeridas : 
      this.contexto.diagnosticos;
  }
}

// Exportar una instancia única
export const contextManager = new ContextManager();