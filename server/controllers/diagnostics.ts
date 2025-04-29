import { Request, Response, Express } from 'express';
import { IStorage } from '../storage';
import { analyzeDiagnostic, ChatMessage } from '../services/anthropic_minimal';
import { z } from 'zod';

// Esquema de validación para la solicitud de diagnóstico
const diagnosticRequestSchema = z.object({
  vehicleInfo: z.object({
    year: z.number().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    engine: z.string().optional(),
  }).optional(),
  obdCodes: z.array(z.string()).optional(),
  symptoms: z.array(z.string()).optional(),
  additionalInfo: z.string().optional(),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
});

// Tipo de la solicitud de diagnóstico
interface DiagnosticRequest {
  vehicleInfo?: {
    year?: number;
    make?: string;
    model?: string;
    engine?: string;
  };
  obdCodes?: string[];
  symptoms?: string[];
  additionalInfo?: string;
  chatHistory?: ChatMessage[];
}

/**
 * Registra las rutas relacionadas con diagnósticos
 * @param app Instancia de Express
 * @param prefix Prefijo de la ruta API
 * @param storage Interfaz de almacenamiento
 */
// Extendiendo la interfaz de Express.Request para incluir isAuthenticated y user
declare global {
  namespace Express {
    interface Request {
      isAuthenticated?: () => boolean;
      user?: any;
    }
  }
}

export function registerDiagnosticRoutes(app: Express, prefix: string, storage: IStorage) {
  // Ruta para analizar diagnóstico
  app.post(`${prefix}/diagnostics/analyze`, async (req: Request, res: Response) => {
    try {
      // Validar la solicitud
      const result = diagnosticRequestSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          error: 'Datos de solicitud inválidos',
          details: result.error.errors
        });
      }
      
      // MODO PRUEBA: Establecer un usuario de prueba si no hay usuario autenticado
      if (!req.user) {
        req.user = {
          id: 1,
          username: 'usuario_prueba',
          role: 'user'
        };
      }
      
      // Código original - comentado durante pruebas
      /*
      // Si el usuario no está autenticado, rechazar la solicitud
      if (!req.isAuthenticated || !(req as any).isAuthenticated()) {
        return res.status(401).json({
          error: 'No autorizado. Debes iniciar sesión para usar el diagnóstico.'
        });
      }
      */
      
      const userId = (req as any).user.id;
      const data = result.data as DiagnosticRequest;
      
      // Realizar análisis con Anthropic
      const analysis = await analyzeDiagnostic(
        data.vehicleInfo,
        data.obdCodes,
        data.symptoms,
        data.additionalInfo,
        data.chatHistory
      );
      
      // Devolver respuesta
      res.json({
        chatHistory: analysis.chatHistory,
        diagnosis: analysis.diagnosis,
        severity: analysis.severity
      });
    } catch (error: any) {
      console.error('Error en el análisis de diagnóstico:', error);
      res.status(500).json({
        error: 'Error al procesar la solicitud de diagnóstico',
        message: error?.message || 'Error desconocido'
      });
    }
  });
  
  // Ruta para obtener todos los diagnósticos del usuario
  app.get(`${prefix}/diagnostics`, async (req: Request, res: Response) => {
    try {
      // MODO PRUEBA: Establecer un usuario de prueba si no hay usuario autenticado
      if (!req.user) {
        req.user = {
          id: 1,
          username: 'usuario_prueba',
          role: 'user'
        };
      }
      
      // Código original - comentado durante pruebas
      /*
      // Si el usuario no está autenticado, rechazar la solicitud
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
          error: 'No autorizado. Debes iniciar sesión para ver tus diagnósticos.'
        });
      }
      */
      
      const userId = req.user?.id;
      
      // Obtener diagnósticos del usuario
      const diagnostics = await storage.getDiagnostics(userId);
      
      res.json(diagnostics);
    } catch (error: any) {
      console.error('Error al obtener diagnósticos:', error);
      res.status(500).json({
        error: 'Error al obtener diagnósticos',
        message: error?.message || 'Error desconocido'
      });
    }
  });
  
  // Ruta para obtener un diagnóstico específico
  app.get(`${prefix}/diagnostics/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: 'ID de diagnóstico inválido'
        });
      }
      
      // MODO PRUEBA: Establecer un usuario de prueba si no hay usuario autenticado
      if (!req.user) {
        req.user = {
          id: 1,
          username: 'usuario_prueba',
          role: 'user'
        };
      }
      
      // Código original - comentado durante pruebas
      /*
      // Si el usuario no está autenticado, rechazar la solicitud
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
          error: 'No autorizado. Debes iniciar sesión para ver este diagnóstico.'
        });
      }
      */
      
      // Obtener diagnóstico
      const diagnostic = await storage.getDiagnosticById(id);
      
      if (!diagnostic) {
        return res.status(404).json({
          error: 'Diagnóstico no encontrado'
        });
      }
      
      // Verificar que el diagnóstico pertenezca al usuario actual
      if (diagnostic.userId !== req.user?.id) {
        return res.status(403).json({
          error: 'No tienes permiso para acceder a este diagnóstico'
        });
      }
      
      res.json(diagnostic);
    } catch (error: any) {
      console.error('Error al obtener diagnóstico:', error);
      res.status(500).json({
        error: 'Error al obtener diagnóstico',
        message: error?.message || 'Error desconocido'
      });
    }
  });
  
  // Ruta para eliminar un diagnóstico
  app.delete(`${prefix}/diagnostics/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: 'ID de diagnóstico inválido'
        });
      }
      
      // MODO PRUEBA: Establecer un usuario de prueba si no hay usuario autenticado
      if (!req.user) {
        req.user = {
          id: 1,
          username: 'usuario_prueba',
          role: 'user'
        };
      }
      
      // Código original - comentado durante pruebas
      /*
      // Si el usuario no está autenticado, rechazar la solicitud
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
          error: 'No autorizado. Debes iniciar sesión para eliminar este diagnóstico.'
        });
      }
      */
      
      // Obtener diagnóstico para verificar propiedad
      const diagnostic = await storage.getDiagnosticById(id);
      
      if (!diagnostic) {
        return res.status(404).json({
          error: 'Diagnóstico no encontrado'
        });
      }
      
      // Verificar que el diagnóstico pertenezca al usuario actual
      if (diagnostic.userId !== req.user?.id) {
        return res.status(403).json({
          error: 'No tienes permiso para eliminar este diagnóstico'
        });
      }
      
      // Eliminar diagnóstico
      const success = await storage.deleteDiagnostic(id);
      
      if (success) {
        res.json({ success: true, message: 'Diagnóstico eliminado correctamente' });
      } else {
        res.status(500).json({ error: 'No se pudo eliminar el diagnóstico' });
      }
    } catch (error: any) {
      console.error('Error al eliminar diagnóstico:', error);
      res.status(500).json({
        error: 'Error al eliminar diagnóstico',
        message: error?.message || 'Error desconocido'
      });
    }
  });
  
  // Ruta para obtener códigos OBD comunes
  app.get(`${prefix}/diagnostics/codes`, async (req: Request, res: Response) => {
    // Lista de códigos OBD comunes (podría venir de una base de datos)
    const commonCodes = [
      { code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected' },
      { code: 'P0171', description: 'System Too Lean (Bank 1)' },
      { code: 'P0174', description: 'System Too Lean (Bank 2)' },
      { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold (Bank 1)' },
      { code: 'P0430', description: 'Catalyst System Efficiency Below Threshold (Bank 2)' },
      { code: 'P0442', description: 'Evaporative Emission Control System Leak Detected (Small Leak)' },
      { code: 'P0455', description: 'Evaporative Emission Control System Leak Detected (Large Leak)' },
      { code: 'P0401', description: 'Exhaust Gas Recirculation Flow Insufficient Detected' },
      { code: 'P0128', description: 'Coolant Thermostat Malfunction' },
      { code: 'P0303', description: 'Cylinder 3 Misfire Detected' },
    ];
    
    res.json(commonCodes);
  });
  
  // Ruta para obtener síntomas comunes
  app.get(`${prefix}/diagnostics/symptoms`, async (req: Request, res: Response) => {
    // Lista de síntomas comunes (podría venir de una base de datos)
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
    
    res.json(commonSymptoms);
  });
}