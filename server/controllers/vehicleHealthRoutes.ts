import { Express } from 'express';
import { IStorage } from '../storage';
import { analyzeHealth, getHealthHistory, getHealthAnalysis } from './vehicleHealth';

/**
 * Registra las rutas para la funcionalidad de análisis de salud vehicular
 */
export function registerVehicleHealthRoutes(app: Express, apiPrefix: string, storage: IStorage) {
  // Ruta para solicitar un análisis de salud vehicular
  app.post(`${apiPrefix}/vehicle-health/analyze`, analyzeHealth);
  
  // Ruta para obtener el historial de análisis de salud
  app.get(`${apiPrefix}/vehicle-health/history`, getHealthHistory);
  
  // Ruta para obtener un análisis específico
  app.get(`${apiPrefix}/vehicle-health/:id`, getHealthAnalysis);
}