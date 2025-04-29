import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/lib/app-context';
import { useToast } from '@/hooks/use-toast';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { AlertCircle, Car, Plus, Trash2, Wifi } from 'lucide-react';
import { useVehicle } from '@/hooks/use-vehicle';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { SmartcarConnect } from '@/components/smartcar/SmartcarConnect';

// Esquema para formulario de vehículo
const vehicleSchema = z.object({
  year: z.string().min(1, 'Selecciona un año'),
  make: z.string().min(1, 'Selecciona una marca'),
  model: z.string().min(1, 'Selecciona un modelo'),
  engine: z.string().min(1, 'Selecciona un motor'),
  nickname: z.string().optional(),
  vin: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface UserVehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  engine: string;
  nickname?: string;
  vin?: string;
  userId: string;
}

export default function MyVehiclesPage() {
  return (
    <PrivateRoute>
      <MyVehicles />
    </PrivateRoute>
  );
}

function MyVehicles() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [years, setYears] = useState<number[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [engines, setEngines] = useState<string[]>([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [bootSequence, setBootSequence] = useState(true);
  const [bootStage, setBootStage] = useState(0);
  
  // Simulación de vehículos del usuario (en una aplicación real, estos vendrían de Firebase)
  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>([
    {
      id: '1',
      year: '2020',
      make: 'Toyota',
      model: 'Corolla',
      engine: '1.8L',
      nickname: 'Mi corolla',
      userId: currentUser?.uid || ''
    },
    {
      id: '2',
      year: '2019',
      make: 'Honda',
      model: 'Civic',
      engine: '2.0L',
      vin: 'JH4KA4530JC022075',
      userId: currentUser?.uid || ''
    }
  ]);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      year: '',
      make: '',
      model: '',
      engine: '',
      nickname: '',
      vin: '',
    },
  });

  // Obtener años de vehículos
  const { data: yearsData } = useQuery({
    queryKey: ['/api/vehicles/year'],
    enabled: isDialogOpen,
  });

  // Observar cambios en el formulario para cargar datos en cascada
  const watchYear = form.watch('year');
  const watchMake = form.watch('make');
  const watchModel = form.watch('model');

  // Obtener marcas cuando cambia el año
  const { data: makesData } = useQuery({
    queryKey: ['/api/vehicles/make', watchYear],
    enabled: !!watchYear && isDialogOpen,
  });

  // Obtener modelos cuando cambia la marca
  const { data: modelsData } = useQuery({
    queryKey: ['/api/vehicles/model', watchYear, watchMake],
    enabled: !!watchYear && !!watchMake && isDialogOpen,
  });

  // Obtener motores cuando cambia el modelo
  const { data: enginesData } = useQuery({
    queryKey: ['/api/vehicles/engine', watchYear, watchMake, watchModel],
    enabled: !!watchYear && !!watchMake && !!watchModel && isDialogOpen,
  });

  // Animación de escritura y parpadeo del cursor
  useEffect(() => {
    // Iniciar secuencia de boot
    if (bootSequence) {
      const bootMessages = [
        "Iniciando OBi-2 Vehicle Management Module v2.8.5...",
        "Cargando base de datos de vehículos...",
        "Estableciendo conexión con SmartCar API...",
        "Cargando información de vehículos registrados...",
        "Sistema listo."
      ];
      
      const timer = setTimeout(() => {
        if (bootStage < bootMessages.length) {
          setBootStage(prev => prev + 1);
        } else {
          setBootSequence(false);
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
    
    // Efecto de parpadeo del cursor
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    
    return () => clearInterval(cursorInterval);
  }, [bootSequence, bootStage]);
  
  // Actualizar estados cuando cambian los datos
  useEffect(() => {
    if (yearsData) setYears(yearsData as number[]);
  }, [yearsData]);
  
  useEffect(() => {
    if (makesData) setMakes(makesData as string[]);
  }, [makesData]);
  
  useEffect(() => {
    if (modelsData) setModels(modelsData as string[]);
  }, [modelsData]);
  
  useEffect(() => {
    if (enginesData) setEngines(enginesData as string[]);
  }, [enginesData]);

  function handleDeleteVehicle(id: string) {
    // En una aplicación real, esto eliminaría el vehículo de Firebase
    setUserVehicles(userVehicles.filter(vehicle => vehicle.id !== id));
    toast({
      title: 'Vehículo eliminado',
      description: 'El vehículo ha sido eliminado correctamente',
    });
  }

  function handleDialogOpen(open: boolean) {
    setIsDialogOpen(open);
    if (!open) {
      form.reset();
    }
  }

  async function onSubmit(values: VehicleFormValues) {
    try {
      setError('');
      setLoading(true);
      
      // En una aplicación real, guardaríamos estos datos en Firebase
      const newVehicle: UserVehicle = {
        id: Date.now().toString(), // simulación de ID único
        year: values.year,
        make: values.make,
        model: values.model,
        engine: values.engine,
        nickname: values.nickname,
        vin: values.vin,
        userId: currentUser?.uid || ''
      };
      
      setUserVehicles([...userVehicles, newVehicle]);
      
      toast({
        title: 'Vehículo guardado',
        description: 'Tu vehículo ha sido guardado correctamente',
      });
      
      setIsDialogOpen(false);
      form.reset();
    } catch (err: any) {
      console.error(err);
      setError('Error al guardar vehículo: ' + (err.message || 'Inténtalo de nuevo'));
    } finally {
      setLoading(false);
    }
  }

  // Si está en la secuencia de arranque, mostrar animación
  if (bootSequence) {
    const bootMessages = [
      "Iniciando OBi-2 Vehicle Management Module v2.8.5...",
      "Cargando base de datos de vehículos...",
      "Estableciendo conexión con SmartCar API...",
      "Cargando información de vehículos registrados...",
      "Sistema listo."
    ];
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md p-6 rounded-md border border-green-500 bg-black text-green-500 font-mono">
          <div className="flex items-center gap-3 mb-6 border-b border-green-500/30 pb-3">
            <Car className="h-5 w-5" />
            <span className="text-sm font-bold">AUTOLOGIC VEHICLE MANAGER v2.8.5</span>
          </div>
          
          <div className="space-y-2">
            {bootMessages.slice(0, bootStage).map((message, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-green-400">$</span>
                <span>{message}</span>
              </div>
            ))}
            
            {bootStage < bootMessages.length && (
              <div className="flex items-start gap-2">
                <span className="text-green-400">$</span>
                <span className="animate-pulse">_</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="w-full p-6 rounded-md border border-green-500 bg-black text-green-500 font-mono">
          {/* Cabecera tipo terminal */}
          <div className="flex items-center justify-between mb-6 border-b border-green-500/30 pb-3">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              <span className="text-sm font-bold">VEHICLE_MANAGER.sh v2.8.5</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
          </div>
        
          {/* Título y controles */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center">
              <h1 className="text-xl font-bold tracking-tight">GESTIÓN DE VEHÍCULOS</h1>
              <span className={cursorVisible ? "opacity-100 ml-2" : "opacity-0 ml-2"}>▋</span>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-green-900 hover:bg-green-800 text-green-50 border border-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  REGISTRAR NUEVO VEHÍCULO
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-gray-900 border-green-500 text-gray-100">
                <DialogHeader>
                  <DialogTitle className="text-green-500">_{">"} NUEVO VEHÍCULO</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Ingresa la información de tu vehículo para guardarlo en tu perfil
                  </DialogDescription>
                </DialogHeader>
                
                {error && (
                  <Alert variant="destructive" className="border border-red-600 bg-black text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-400">AÑO</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-green-500 bg-black text-green-500">
                                <SelectValue placeholder="Selecciona el año" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-900 border-green-500 text-green-500">
                              {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-400">MARCA</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={!watchYear}
                          >
                            <FormControl>
                              <SelectTrigger className="border-green-500 bg-black text-green-500 disabled:text-gray-500 disabled:bg-gray-900">
                                <SelectValue placeholder="Selecciona la marca" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-900 border-green-500 text-green-500">
                              {makes.map(make => (
                                <SelectItem key={make} value={make}>
                                  {make}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-400">MODELO</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={!watchMake}
                          >
                            <FormControl>
                              <SelectTrigger className="border-green-500 bg-black text-green-500 disabled:text-gray-500 disabled:bg-gray-900">
                                <SelectValue placeholder="Selecciona el modelo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-900 border-green-500 text-green-500">
                              {models.map(model => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="engine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-400">MOTOR</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={!watchModel}
                          >
                            <FormControl>
                              <SelectTrigger className="border-green-500 bg-black text-green-500 disabled:text-gray-500 disabled:bg-gray-900">
                                <SelectValue placeholder="Selecciona el motor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-900 border-green-500 text-green-500">
                              {engines.map(engine => (
                                <SelectItem key={engine} value={engine}>
                                  {engine}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-400">APODO (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Mi auto" {...field} className="border-green-500 bg-black text-green-500" />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Un nombre para identificar fácilmente tu vehículo
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-400">VIN (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Número de identificación del vehículo" {...field} className="border-green-500 bg-black text-green-500" />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            El número de identificación del vehículo (17 caracteres)
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={loading} className="mt-4 md:mt-0 bg-green-900 hover:bg-green-800 text-green-50 border border-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            GUARDANDO...
                          </span>
                        ) : (
                          'REGISTRAR VEHÍCULO'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Tabs para vehículos */}
          <Tabs defaultValue="manual" className="mb-6">
            <TabsList className="bg-gray-900 border border-green-500">
              <TabsTrigger 
                value="manual" 
                className="flex items-center data-[state=active]:bg-green-900 data-[state=active]:text-green-50 text-green-500"
              >
                <Car className="h-4 w-4 mr-2" />
                <span>MIS VEHÍCULOS</span>
              </TabsTrigger>
              <TabsTrigger 
                value="smartcar" 
                className="flex items-center data-[state=active]:bg-green-900 data-[state=active]:text-green-50 text-green-500"
              >
                <Wifi className="h-4 w-4 mr-2" />
                <span>CONECTAR SMARTCAR</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="pt-6">
              {userVehicles.length === 0 ? (
                <div className="text-center py-12 border border-green-500/30 bg-black rounded-md">
                  <Car className="mx-auto h-12 w-12 text-green-500/50" />
                  <h3 className="mt-4 text-lg font-bold text-green-500">NO HAY VEHÍCULOS REGISTRADOS</h3>
                  <p className="mt-2 text-sm text-green-400/70">
                    Agrega un vehículo para obtener diagnósticos y recomendaciones
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userVehicles.map(vehicle => (
                    <Card key={vehicle.id} className="overflow-hidden bg-black border border-green-500 text-green-500">
                      <CardHeader className="bg-gray-900/50 border-b border-green-500/30 pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-mono">
                            {vehicle.nickname ? (
                              <>{vehicle.nickname} <span className="text-xs text-green-500/50">({vehicle.year} {vehicle.make})</span></>
                            ) : (
                              <>{vehicle.year} {vehicle.make} {vehicle.model}</>
                            )}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-900/20 p-2 h-auto"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 font-mono">
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-1 text-sm border-b border-green-500/20 pb-2">
                            <div className="text-green-400/80">AÑO:</div>
                            <div className="col-span-2 font-medium">{vehicle.year}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-sm border-b border-green-500/20 pb-2">
                            <div className="text-green-400/80">MARCA:</div>
                            <div className="col-span-2 font-medium">{vehicle.make}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-sm border-b border-green-500/20 pb-2">
                            <div className="text-green-400/80">MODELO:</div>
                            <div className="col-span-2 font-medium">{vehicle.model}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-sm border-b border-green-500/20 pb-2">
                            <div className="text-green-400/80">MOTOR:</div>
                            <div className="col-span-2 font-medium">{vehicle.engine}</div>
                          </div>
                          {vehicle.vin && (
                            <div className="grid grid-cols-3 gap-1 text-sm border-b border-green-500/20 pb-2">
                              <div className="text-green-400/80">VIN:</div>
                              <div className="col-span-2 font-medium">{vehicle.vin}</div>
                            </div>
                          )}
                          <div className="text-xs text-green-400/60 pt-1 text-right">
                            ID: {vehicle.id.substring(0, 8)}...
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-green-500/30 bg-gray-900/30 pt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border border-green-500 text-green-500 hover:bg-green-900/30"
                        >
                          BUSCAR PRODUCTOS COMPATIBLES
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="smartcar" className="pt-6 bg-black border border-green-500 rounded-md p-4">
              <div className="text-green-500 font-mono">
                <h3 className="text-lg mb-2 border-b border-green-500/30 pb-2">_{">"} SMARTCAR CONNECT</h3>
                <p className="mb-4 text-green-400">Conecta tu vehículo a través de SmartCar API para diagnósticos en tiempo real</p>
                <SmartcarConnect />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}