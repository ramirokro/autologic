import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { VehicleHealthRequestData, VehicleHealthAnalysis, MaintenanceRecord } from '@/types/vehicleHealth';
import { analyzeVehicleHealth } from '@/lib/vehicleHealthService';
import { Loader2, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { HealthPredictionResult } from '@/components/vehicleHealth/HealthPredictionResult';

// Esquema para validación del formulario
const healthFormSchema = z.object({
  vehicleId: z.number().optional(),
  vehicleData: z.object({
    make: z.string().min(1, "La marca es requerida"),
    model: z.string().min(1, "El modelo es requerido"),
    year: z.number().min(1900, "Año inválido"),
    engine: z.string().optional()
  }),
  symptoms: z.array(z.string()).min(1, "Ingresa al menos un síntoma"),
  mileage: z.number().min(0, "El kilometraje no puede ser negativo"),
  additionalInfo: z.string().optional(),
  maintenanceHistory: z.array(
    z.object({
      service: z.string(),
      date: z.string(),
      mileage: z.number()
    })
  ).optional().default([])
});

type HealthFormData = z.infer<typeof healthFormSchema>;

// Componente para la página de predicción de salud vehicular
export default function VehicleHealthPage() {
  const { toast } = useToast();
  const [symptomInput, setSymptomInput] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [maintenanceInput, setMaintenanceInput] = useState({
    service: '',
    date: '',
    mileage: 0
  });
  const [analysisResult, setAnalysisResult] = useState<VehicleHealthAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Configuración de formulario con react-hook-form
  const form = useForm<HealthFormData>({
    resolver: zodResolver(healthFormSchema),
    defaultValues: {
      vehicleData: {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        engine: ''
      },
      symptoms: [],
      mileage: 0,
      additionalInfo: '',
      maintenanceHistory: []
    }
  });

  // Obtener años de vehículos disponibles
  const { data: years } = useQuery({
    queryKey: ['/api/vehicles/year'],
    refetchOnWindowFocus: false
  });

  // Obtener marcas basadas en el año seleccionado
  const { data: makes, isFetching: isFetchingMakes } = useQuery({
    queryKey: ['/api/vehicles/make', { year: form.watch('vehicleData.year') }],
    enabled: !!form.watch('vehicleData.year'),
    refetchOnWindowFocus: false
  });

  // Obtener modelos basados en el año y marca seleccionados
  const { data: models, isFetching: isFetchingModels } = useQuery({
    queryKey: ['/api/vehicles/model', { 
      year: form.watch('vehicleData.year'),
      make: form.watch('vehicleData.make')
    }],
    enabled: !!form.watch('vehicleData.year') && !!form.watch('vehicleData.make'),
    refetchOnWindowFocus: false
  });

  // Obtener motores basados en el año, marca y modelo seleccionados
  const { data: engines, isFetching: isFetchingEngines } = useQuery({
    queryKey: ['/api/vehicles/engine', { 
      year: form.watch('vehicleData.year'),
      make: form.watch('vehicleData.make'),
      model: form.watch('vehicleData.model')
    }],
    enabled: !!form.watch('vehicleData.year') && !!form.watch('vehicleData.make') && !!form.watch('vehicleData.model'),
    refetchOnWindowFocus: false
  });

  // Mutación para análisis de salud
  const analysisMutation = useMutation({
    mutationFn: analyzeVehicleHealth,
    onSuccess: (data) => {
      setAnalysisResult(data.analysis);
      setIsAnalyzing(false);
      toast({
        title: "Análisis completado",
        description: "El análisis de salud de tu vehículo está listo.",
      });
      
      // Invalidar consultas relacionadas si es necesario
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-health/history'] });
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast({
        title: "Error en el análisis",
        description: error instanceof Error ? error.message : "Ocurrió un error al analizar la salud del vehículo.",
        variant: "destructive"
      });
    }
  });

  // Agregar síntoma a la lista
  const addSymptom = () => {
    if (symptomInput.trim()) {
      const newSymptoms = [...symptoms, symptomInput.trim()];
      setSymptoms(newSymptoms);
      form.setValue('symptoms', newSymptoms);
      setSymptomInput('');
    }
  };

  // Eliminar síntoma de la lista
  const removeSymptom = (index: number) => {
    const newSymptoms = symptoms.filter((_, i) => i !== index);
    setSymptoms(newSymptoms);
    form.setValue('symptoms', newSymptoms);
  };

  // Agregar registro de mantenimiento
  const addMaintenanceRecord = () => {
    if (maintenanceInput.service.trim() && maintenanceInput.date) {
      const newRecords = [...maintenanceRecords, { 
        ...maintenanceInput,
        service: maintenanceInput.service.trim()
      }];
      setMaintenanceRecords(newRecords);
      form.setValue('maintenanceHistory', newRecords);
      setMaintenanceInput({
        service: '',
        date: '',
        mileage: 0
      });
    }
  };

  // Eliminar registro de mantenimiento
  const removeMaintenanceRecord = (index: number) => {
    const newRecords = maintenanceRecords.filter((_, i) => i !== index);
    setMaintenanceRecords(newRecords);
    form.setValue('maintenanceHistory', newRecords);
  };

  // Enviar formulario
  const onSubmit = (data: HealthFormData) => {
    setIsAnalyzing(true);
    analysisMutation.mutate(data as VehicleHealthRequestData);
  };

  // Función para usar un nuevo análisis
  const handleNewAnalysis = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Predicción de Salud Vehicular</h1>
      <p className="text-lg mb-8">
        Nuestro sistema de IA analizará la salud de tu vehículo basándose en los datos que proporciones
        y te dará recomendaciones personalizadas de mantenimiento.
      </p>

      {!analysisResult ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Vehículo</CardTitle>
              <CardDescription>
                Proporciona los detalles de tu vehículo para un análisis preciso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Sección: Datos del vehículo */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="vehicleData.year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Año</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el año" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(years) && years.map((year: number) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleData.make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!form.watch('vehicleData.year') || isFetchingMakes}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona la marca" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(makes) && makes.map((make: string) => (
                                <SelectItem key={make} value={make}>
                                  {make}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleData.model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!form.watch('vehicleData.make') || isFetchingModels}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el modelo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(models) && models.map((model: string) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleData.engine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motor (opcional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={!form.watch('vehicleData.model') || isFetchingEngines}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el motor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(engines) && engines.map((engine: string) => (
                                <SelectItem key={engine} value={engine}>
                                  {engine}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kilometraje Actual</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="ej. 50000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Sección: Síntomas */}
                  <div className="pt-4 space-y-4">
                    <h3 className="text-lg font-medium">Síntomas</h3>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Describe un síntoma que has notado"
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={addSymptom}
                      >
                        Agregar
                      </Button>
                    </div>
                    
                    {form.formState.errors.symptoms && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.symptoms.message}
                      </p>
                    )}
                    
                    {symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {symptoms.map((symptom, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="cursor-pointer p-2"
                            onClick={() => removeSymptom(index)}
                          >
                            {symptom} &times;
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sección: Historial de mantenimiento */}
                  <div className="pt-4 space-y-4">
                    <h3 className="text-lg font-medium">Historial de Mantenimiento (opcional)</h3>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Servicio realizado"
                          value={maintenanceInput.service}
                          onChange={(e) => setMaintenanceInput({
                            ...maintenanceInput,
                            service: e.target.value
                          })}
                        />
                        <Input
                          type="date"
                          value={maintenanceInput.date}
                          onChange={(e) => setMaintenanceInput({
                            ...maintenanceInput,
                            date: e.target.value
                          })}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Kilometraje al momento del servicio"
                          value={maintenanceInput.mileage || ''}
                          onChange={(e) => setMaintenanceInput({
                            ...maintenanceInput,
                            mileage: parseInt(e.target.value) || 0
                          })}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={addMaintenanceRecord}
                          disabled={!maintenanceInput.service || !maintenanceInput.date}
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>
                    
                    {maintenanceRecords.length > 0 && (
                      <div className="mt-4 border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Servicio</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Fecha</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Km</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {maintenanceRecords.map((record, index) => (
                              <tr key={index} className="bg-card">
                                <td className="px-4 py-2 text-sm">{record.service}</td>
                                <td className="px-4 py-2 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-sm">{record.mileage.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right">
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeMaintenanceRecord(index)}
                                  >
                                    &times;
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Sección: Información adicional */}
                  <div className="pt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Información Adicional (opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Cualquier detalle adicional que quieras mencionar"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analizando...
                      </>
                    ) : 'Analizar Salud Vehicular'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guía de Uso</CardTitle>
              <CardDescription>
                Cómo obtener los mejores resultados de tu análisis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Info className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Información precisa</h4>
                  <p className="text-muted-foreground">Ingresa información precisa sobre tu vehículo, incluyendo el año, marca, modelo y motor exactos.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Síntomas detallados</h4>
                  <p className="text-muted-foreground">Describe los síntomas con el mayor detalle posible. Por ejemplo, en lugar de "ruido extraño", especifica "ruido metálico al frenar".</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Historial de mantenimiento</h4>
                  <p className="text-muted-foreground">Incluir tu historial de mantenimiento reciente ayuda a nuestro sistema a proporcionar recomendaciones más precisas.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Información adicional</h4>
                  <p className="text-muted-foreground">Incluye cualquier detalle relevante como condiciones de manejo, clima, o cambios recientes en el rendimiento del vehículo.</p>
                </div>
              </div>

              <Separator className="my-6" />
              
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Nota importante</h4>
                <p className="text-sm text-muted-foreground">
                  Esta herramienta proporciona recomendaciones basadas en IA y no sustituye una inspección profesional.
                  Si tu vehículo presenta problemas graves, te recomendamos consultar con un mecánico certificado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <HealthPredictionResult 
          analysis={analysisResult!} 
          onNewAnalysis={handleNewAnalysis} 
        />
      )}
    </div>
  );
}