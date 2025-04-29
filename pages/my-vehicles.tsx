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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agregar Vehículo</DialogTitle>
              <DialogDescription>
                Ingresa la información de tu vehículo para guardarlo en tu perfil
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive">
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
                      <FormLabel>Año</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el año" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map(year => (
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
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!watchYear}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona la marca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {makes.map(make => (
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
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!watchMake}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el modelo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {models.map(model => (
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
                  name="engine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motor</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!watchModel}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el motor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {engines.map(engine => (
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
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apodo (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Mi auto" {...field} />
                      </FormControl>
                      <FormDescription>
                        Un nombre para identificar fácilmente tu vehículo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Número de identificación del vehículo" {...field} />
                      </FormControl>
                      <FormDescription>
                        El número de identificación del vehículo (17 caracteres)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Guardando...
                      </span>
                    ) : (
                      'Guardar Vehículo'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="manual" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center">
            <Car className="h-4 w-4 mr-2" />
            <span>Mis vehículos</span>
          </TabsTrigger>
          <TabsTrigger value="smartcar" className="flex items-center">
            <Wifi className="h-4 w-4 mr-2" />
            <span>Conectar SmartCar</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userVehicles.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
                <Car className="mx-auto h-12 w-12 text-neutral-400" />
                <h3 className="mt-4 text-lg font-medium">No tienes vehículos guardados</h3>
                <p className="mt-2 text-sm text-neutral-500">
                  Agrega un vehículo para obtener recomendaciones personalizadas
                </p>
              </div>
            ) : (
              userVehicles.map(vehicle => (
                <Card key={vehicle.id} className="overflow-hidden">
                  <CardHeader className="bg-neutral-50 border-b pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-1 text-sm">
                        <div className="text-neutral-500">Año:</div>
                        <div className="col-span-2 font-medium">{vehicle.year}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-sm">
                        <div className="text-neutral-500">Marca:</div>
                        <div className="col-span-2 font-medium">{vehicle.make}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-sm">
                        <div className="text-neutral-500">Modelo:</div>
                        <div className="col-span-2 font-medium">{vehicle.model}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-sm">
                        <div className="text-neutral-500">Motor:</div>
                        <div className="col-span-2 font-medium">{vehicle.engine}</div>
                      </div>
                      {vehicle.vin && (
                        <div className="grid grid-cols-3 gap-1 text-sm">
                          <div className="text-neutral-500">VIN:</div>
                          <div className="col-span-2 font-medium">{vehicle.vin}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-neutral-50 pt-3">
                    <Button variant="outline" size="sm" className="w-full">
                      Buscar Productos Compatibles
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="smartcar" className="pt-6">
          <SmartcarConnect />
        </TabsContent>
      </Tabs>
    </div>
  );
}