import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleHealthAnalysis, SystemHealthLevel, PotentialIssue, MaintenanceRecommendation } from '@/types/vehicleHealth';
import { Car, AlertCircle, Wrench, Gauge, HeartPulse, ShieldCheck } from 'lucide-react';

interface HealthPredictionResultProps {
  analysis: VehicleHealthAnalysis;
  onNewAnalysis: () => void;
}

// Función para determinar el color según la importancia
const getImportanceColor = (importance: string): string => {
  switch (importance) {
    case 'urgent':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'recommended':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'routine':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return '';
  }
};

// Función para determinar el color según el nivel de urgencia
const getUrgencyColor = (urgency: string): string => {
  switch (urgency) {
    case 'critical':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'high':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    default:
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  }
};

// Función para determinar el color según la dificultad DIY
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'complex':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'professional':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return '';
  }
};

export function HealthPredictionResult({ analysis, onNewAnalysis }: HealthPredictionResultProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Resultado del Análisis</h2>
        <Button variant="outline" onClick={onNewAnalysis}>
          Nuevo Análisis
        </Button>
      </div>

      {/* Tarjeta de resumen superior */}
      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
            <span className="text-3xl font-bold">{analysis.healthScore}</span>
            <span className="text-lg font-medium">Puntuación de Salud</span>
          </div>

          <div className="flex flex-col justify-center p-4 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-1">Nivel de Urgencia</span>
            <span className="text-lg font-medium capitalize">
              {analysis.urgencyLevel === 'critical' ? 'Crítico' :
               analysis.urgencyLevel === 'high' ? 'Alto' :
               analysis.urgencyLevel === 'medium' ? 'Medio' :
               'Bajo'}
            </span>
          </div>

          <div className="flex flex-col justify-center p-4 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-1">Problemas Potenciales</span>
            <span className="text-3xl font-bold">{analysis.potentialIssues.length}</span>
            <span className="text-sm text-muted-foreground">
              {analysis.potentialIssues.filter(i => i.urgency === 'high' || i.urgency === 'critical').length} urgentes
            </span>
          </div>

          <div className="flex flex-col justify-center p-4 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-1">Vida Útil Estimada</span>
            <span className="text-3xl font-bold">{analysis.vehicleLifeEstimate.remainingYears}</span>
            <span className="text-sm text-muted-foreground">años restantes</span>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas para diferentes secciones del análisis */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl mx-auto mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="issues">Problemas</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
          <TabsTrigger value="lifespan">Vida Útil</TabsTrigger>
        </TabsList>

        {/* Pestaña de Análisis General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis General</CardTitle>
              <CardDescription>Estado general del vehículo basado en los datos proporcionados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p>{analysis.analysis}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Nivel de Salud</CardTitle>
              <CardDescription>Estado de los sistemas principales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.systemHealthLevels.map((system: SystemHealthLevel, index: number) => (
                  <div key={index} className="flex flex-col space-y-2 bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{system.system}</h4>
                      <Badge
                        variant="outline"
                        className={system.health > 75 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                  system.health > 50 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                  system.health > 25 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}
                      >
                        {system.health}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          system.health > 75 ? "bg-green-500" :
                          system.health > 50 ? "bg-yellow-500" :
                          system.health > 25 ? "bg-orange-500" :
                          "bg-red-500"
                        }`}
                        style={{ width: `${system.health}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">{system.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Problemas Potenciales */}
        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Problemas Potenciales</CardTitle>
              <CardDescription>
                Problemas detectados con su probabilidad, urgencia y costo estimado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {analysis.potentialIssues
                  .sort((a, b) => {
                    // Ordenar por urgencia (crítico, alto, medio, bajo)
                    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
                  })
                  .map((issue, index) => (
                    <div key={index} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between mb-2">
                        <h3 className="text-lg font-medium flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2 text-muted-foreground" />
                          {issue.issue}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline"
                            className={getUrgencyColor(issue.urgency)}
                          >
                            {issue.urgency === 'critical' ? 'Crítico' :
                             issue.urgency === 'high' ? 'Alto' :
                             issue.urgency === 'medium' ? 'Medio' :
                             'Bajo'}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(issue.probability * 100)}% Probabilidad
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{issue.description}</p>
                      <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-y-2 gap-x-4">
                        <div>Costo estimado: ${issue.estimatedCost.min.toLocaleString()} - ${issue.estimatedCost.max.toLocaleString()}</div>
                        {issue.affectedComponents && (
                          <div>Componentes afectados: {issue.affectedComponents.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Recomendaciones de Mantenimiento */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones de Mantenimiento</CardTitle>
              <CardDescription>
                Servicios recomendados para mantener y mejorar la salud del vehículo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {analysis.maintenanceRecommendations
                  .sort((a, b) => {
                    // Ordenar por importancia (urgente, recomendado, rutina)
                    const importanceOrder = { urgent: 0, recommended: 1, routine: 2 };
                    return importanceOrder[a.importance] - importanceOrder[b.importance];
                  })
                  .map((recommendation, index) => (
                    <div key={index} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">{recommendation.recommendation}</h3>
                        <Badge 
                          variant="outline"
                          className={getImportanceColor(recommendation.importance)}
                        >
                          {recommendation.importance === 'urgent' ? 'Urgente' :
                           recommendation.importance === 'recommended' ? 'Recomendado' :
                           'Rutina'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-y-2 gap-x-4 mb-3">
                        <div>En aproximadamente {recommendation.dueInMiles.toLocaleString()} km</div>
                        <div>Costo estimado: ${recommendation.estimatedCost.min.toLocaleString()} - ${recommendation.estimatedCost.max.toLocaleString()}</div>
                      </div>
                      {recommendation.diyDifficulty && (
                        <div className="flex items-center mt-2">
                          <Wrench className="w-4 h-4 mr-1 text-muted-foreground" />
                          <Badge 
                            variant="outline" 
                            className={getDifficultyColor(recommendation.diyDifficulty)}
                          >
                            DIY: {recommendation.diyDifficulty === 'easy' ? 'Fácil' :
                                  recommendation.diyDifficulty === 'moderate' ? 'Moderado' :
                                  recommendation.diyDifficulty === 'complex' ? 'Complejo' :
                                  'Profesional'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Vida Útil */}
        <TabsContent value="lifespan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estimación de Vida Útil</CardTitle>
              <CardDescription>
                Análisis de la vida útil restante del vehículo y factores limitantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center mb-8 py-6">
                <div className="flex items-center justify-center w-32 h-32 rounded-full bg-muted mb-4">
                  <Car className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-3xl font-bold mb-1">{analysis.vehicleLifeEstimate.remainingYears} años</h3>
                <p className="text-muted-foreground">de vida útil restante estimada</p>
              </div>

              <h4 className="text-lg font-medium mb-3">Factores Limitantes Clave</h4>
              <ul className="space-y-2 mb-4">
                {analysis.vehicleLifeEstimate.keyLimitingFactors.map((factor, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>

              <Separator className="my-6" />

              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Nota sobre la estimación</h4>
                <p className="text-sm text-muted-foreground">
                  Esta estimación se basa en los datos proporcionados, patrones de mantenimiento, 
                  y estadísticas para vehículos similares. La vida útil real puede variar dependiendo 
                  de factores como el mantenimiento futuro, estilo de conducción, condiciones climáticas, 
                  y otros aspectos no considerados en el análisis actual.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}