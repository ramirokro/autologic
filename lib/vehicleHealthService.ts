import { apiRequest } from './queryClient';
import { 
  VehicleHealthRequestData,
  VehicleHealthAnalysis,
  VehicleHealthHistoryItem,
  VehicleHealthAnalysisDetail
} from '@/types/vehicleHealth';

/**
 * Solicita un análisis de salud para un vehículo
 * @param data Datos para el análisis
 * @returns Resultado del análisis
 */
export async function analyzeVehicleHealth(data: VehicleHealthRequestData): Promise<{
  analysisId: number | null;
  analysis: VehicleHealthAnalysis;
}> {
  const response = await apiRequest('POST', '/api/vehicle-health/analyze', data);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al analizar la salud del vehículo');
  }
  
  return response.json();
}

/**
 * Obtiene el historial de análisis de salud
 * @returns Lista de análisis previos
 */
export async function getVehicleHealthHistory(): Promise<VehicleHealthHistoryItem[]> {
  const response = await apiRequest('GET', '/api/vehicle-health/history');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener el historial de análisis');
  }
  
  return response.json();
}

/**
 * Obtiene los detalles de un análisis específico
 * @param analysisId ID del análisis
 * @returns Detalles completos del análisis
 */
export async function getVehicleHealthAnalysisDetails(analysisId: number): Promise<VehicleHealthAnalysisDetail> {
  const response = await apiRequest('GET', `/api/vehicle-health/${analysisId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener los detalles del análisis');
  }
  
  return response.json();
}