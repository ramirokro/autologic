/**
 * Tipos para la funcionalidad de predicción de salud vehicular
 */

// Tipos para la solicitud
export interface VehicleHealthRequestData {
  vehicleId?: number;
  vehicleData: {
    make: string;
    model: string;
    year: number;
    engine?: string;
  };
  symptoms: string[];
  maintenanceHistory: MaintenanceRecord[];
  mileage: number;
  additionalInfo?: string;
}

export interface MaintenanceRecord {
  service: string;
  date: string;
  mileage: number;
}

// Tipos para la respuesta
export interface VehicleHealthAnalysis {
  healthScore: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  analysis: string;
  potentialIssues: PotentialIssue[];
  maintenanceRecommendations: MaintenanceRecommendation[];
  vehicleLifeEstimate: {
    remainingYears: number;
    keyLimitingFactors: string[];
  };
  // Niveles de salud de sistemas específicos
  systemHealthLevels: SystemHealthLevel[];
}

export interface SystemHealthLevel {
  system: string;
  health: number; // 0-100
  notes: string;
}

export interface PotentialIssue {
  issue: string;
  probability: number;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: {
    min: number;
    max: number;
  };
  affectedComponents?: string[]; // Componentes afectados por el problema
}

export interface MaintenanceRecommendation {
  recommendation: string;
  importance: 'routine' | 'recommended' | 'urgent';
  dueInMiles: number;
  estimatedCost: {
    min: number;
    max: number;
  };
  diyDifficulty?: 'easy' | 'moderate' | 'complex' | 'professional';
}

// Tipos para el historial
export interface VehicleHealthHistoryItem {
  id: number;
  date: Date;
  vehicle: {
    id: number;
    make: string;
    model: string;
    year: number;
  } | null;
  symptoms: string[];
  severity: string;
  summary: string;
  healthScore: number;
}

// Análisis detallado
export interface VehicleHealthAnalysisDetail {
  id: number;
  createdAt: Date;
  vehicle: {
    id: number;
    make: string;
    model: string;
    year: number;
    engine?: string;
  } | null;
  symptoms: string[];
  additionalInfo: string | null;
  analysis: VehicleHealthAnalysis;
}