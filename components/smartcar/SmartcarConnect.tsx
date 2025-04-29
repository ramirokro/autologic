import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, AlertCircle, Wifi } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface VehicleInfo {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
}

interface VehicleData {
  info?: VehicleInfo;
  odometer?: {
    distance: number;
    timestamp: string;
  };
  fuel?: {
    percent_remaining: number;
    range?: number;
    timestamp: string;
  };
  battery?: {
    percent_remaining: number;
    range?: number;
    timestamp: string;
  };
  engine_oil?: {
    life_remaining?: number;
    timestamp: string;
  };
  tire_pressure?: {
    front_left?: number;
    front_right?: number;
    back_left?: number;
    back_right?: number;
    timestamp: string;
  };
}

export function SmartcarConnect() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState('');
  const [smartcarStatus, setSmartcarStatus] = useState<any>(null);
  const [connectedVehicles, setConnectedVehicles] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  // Tokens para Smartcar
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('smartcar_access_token') || ''
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('smartcar_refresh_token') || ''
  );

  // Verificar estado de configuración de SmartCar
  useEffect(() => {
    async function checkSmartcarStatus() {
      try {
        setStatusLoading(true);
        const response = await apiRequest('GET', '/api/smartcar/status');
        const data = await response.json();
        setSmartcarStatus(data);
      } catch (err: any) {
        console.error('Error al verificar estado de SmartCar:', err);
        setError('Error al verificar la configuración de SmartCar');
      } finally {
        setStatusLoading(false);
      }
    }
    
    checkSmartcarStatus();
  }, []);

  // Si hay un token guardado, obtener vehículos conectados
  useEffect(() => {
    async function fetchVehicles() {
      if (!accessToken) return;
      
      try {
        setLoading(true);
        const response = await apiRequest(
          'GET', 
          `/api/smartcar/vehicles?access_token=${accessToken}`
        );
        
        if (!response.ok) {
          if (response.status === 401 && refreshToken) {
            // Token expirado, intentar refrescar
            await refreshAccessToken();
            return;
          }
          throw new Error('Error al obtener vehículos');
        }
        
        const data = await response.json();
        setConnectedVehicles(data.vehicles || []);
      } catch (err: any) {
        console.error('Error al obtener vehículos:', err);
        setError(`Error al obtener vehículos conectados: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchVehicles();
  }, [accessToken]);

  // Procesar el código de autorización de la URL (para manejo del callback)
  useEffect(() => {
    async function processAuthCode() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          setLoading(true);
          
          const response = await apiRequest('POST', '/api/smartcar/exchange', {
            code
          });
          
          if (!response.ok) {
            throw new Error('Error al intercambiar código');
          }
          
          const data = await response.json();
          
          // Guardar tokens
          setAccessToken(data.access_token);
          setRefreshToken(data.refresh_token);
          
          localStorage.setItem('smartcar_access_token', data.access_token);
          localStorage.setItem('smartcar_refresh_token', data.refresh_token);
          localStorage.setItem('smartcar_token_expiry', data.expires_at);
          
          // Limpiar URL para eliminar el código
          window.history.replaceState({}, document.title, window.location.pathname);
          
          toast({
            title: 'Vehículo conectado',
            description: 'Tu vehículo ha sido conectado correctamente con SmartCar',
          });
        } catch (err: any) {
          setError(`Error al procesar autorización: ${err.message}`);
        } finally {
          setLoading(false);
        }
      }
    }
    
    processAuthCode();
  }, []);

  // Verificar si el token está por expirar
  useEffect(() => {
    function checkTokenExpiry() {
      const expiryTime = localStorage.getItem('smartcar_token_expiry');
      
      if (expiryTime) {
        const expiry = new Date(expiryTime);
        const now = new Date();
        
        // Si faltan menos de 5 minutos para expirar, actualizar token
        if ((expiry.getTime() - now.getTime()) < 5 * 60 * 1000) {
          refreshAccessToken();
        }
      }
    }
    
    // Verificar al cargar y luego cada minuto
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [refreshToken]);

  // Función para actualizar token de acceso
  async function refreshAccessToken() {
    if (!refreshToken) return;
    
    try {
      const response = await apiRequest('POST', '/api/smartcar/refresh', {
        refresh_token: refreshToken
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar token');
      }
      
      const data = await response.json();
      
      // Guardar nuevos tokens
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      
      localStorage.setItem('smartcar_access_token', data.access_token);
      localStorage.setItem('smartcar_refresh_token', data.refresh_token);
      localStorage.setItem('smartcar_token_expiry', data.expires_at);
      
      return true;
    } catch (err: any) {
      console.error('Error al actualizar token:', err);
      
      // Si falla la actualización, limpiar tokens
      setAccessToken('');
      setRefreshToken('');
      localStorage.removeItem('smartcar_access_token');
      localStorage.removeItem('smartcar_refresh_token');
      localStorage.removeItem('smartcar_token_expiry');
      
      return false;
    }
  }

  // Función para iniciar autorización con SmartCar
  async function handleConnect() {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiRequest('GET', '/api/smartcar/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        // Redirigir al usuario a la URL de autorización
        window.location.href = data.authUrl;
      } else {
        setError('No se pudo obtener la URL de autorización');
      }
    } catch (err: any) {
      console.error('Error al conectar con SmartCar:', err);
      setError(`Error al conectar con SmartCar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Función para desconectar de SmartCar (limpiar tokens)
  function handleDisconnect() {
    setAccessToken('');
    setRefreshToken('');
    setConnectedVehicles([]);
    setSelectedVehicle(null);
    setVehicleData(null);
    
    localStorage.removeItem('smartcar_access_token');
    localStorage.removeItem('smartcar_refresh_token');
    localStorage.removeItem('smartcar_token_expiry');
    
    toast({
      title: 'Vehículo desconectado',
      description: 'Tu vehículo ha sido desconectado de SmartCar',
    });
  }

  // Función para obtener datos completos del vehículo
  async function fetchVehicleData(vehicleId: string) {
    if (!accessToken || !vehicleId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await apiRequest(
        'GET',
        `/api/smartcar/vehicles/${vehicleId}/all?access_token=${accessToken}`
      );
      
      if (!response.ok) {
        if (response.status === 401 && refreshToken) {
          // Token expirado, intentar refrescar
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // Reintentar con el nuevo token
            fetchVehicleData(vehicleId);
          }
          return;
        }
        throw new Error('Error al obtener datos del vehículo');
      }
      
      const data = await response.json();
      setVehicleData(data);
      setSelectedVehicle(vehicleId);
      
      toast({
        title: 'Datos actualizados',
        description: 'Se han cargado los datos más recientes del vehículo',
      });
    } catch (err: any) {
      console.error('Error al obtener datos del vehículo:', err);
      setError(`Error al obtener datos del vehículo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Renderizar datos del vehículo en formato legible
  function renderVehicleData() {
    if (!vehicleData) return null;
    
    return (
      <div className="vehicle-data space-y-4">
        <h3 className="text-lg font-semibold">Datos del vehículo</h3>
        
        {/* Información básica */}
        {vehicleData.info && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Información general</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Marca:</div>
                <div className="font-medium">{vehicleData.info.make}</div>
                
                <div className="text-muted-foreground">Modelo:</div>
                <div className="font-medium">{vehicleData.info.model}</div>
                
                <div className="text-muted-foreground">Año:</div>
                <div className="font-medium">{vehicleData.info.year}</div>
                
                {vehicleData.info.vin && (
                  <>
                    <div className="text-muted-foreground">VIN:</div>
                    <div className="font-medium">{vehicleData.info.vin}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Odómetro */}
        {vehicleData.odometer && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Odómetro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Distancia:</div>
                <div className="font-medium">{vehicleData.odometer.distance} km</div>
                
                <div className="text-muted-foreground">Actualizado:</div>
                <div className="font-medium">
                  {new Date(vehicleData.odometer.timestamp).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Combustible */}
        {vehicleData.fuel && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Combustible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Nivel:</div>
                <div className="font-medium">{Math.round(vehicleData.fuel.percent_remaining * 100)}%</div>
                
                {vehicleData.fuel.range && (
                  <>
                    <div className="text-muted-foreground">Autonomía:</div>
                    <div className="font-medium">{vehicleData.fuel.range} km</div>
                  </>
                )}
                
                <div className="text-muted-foreground">Actualizado:</div>
                <div className="font-medium">
                  {new Date(vehicleData.fuel.timestamp).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Batería (vehículos eléctricos) */}
        {vehicleData.battery && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Batería</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Nivel:</div>
                <div className="font-medium">{Math.round(vehicleData.battery.percent_remaining * 100)}%</div>
                
                {vehicleData.battery.range && (
                  <>
                    <div className="text-muted-foreground">Autonomía:</div>
                    <div className="font-medium">{vehicleData.battery.range} km</div>
                  </>
                )}
                
                <div className="text-muted-foreground">Actualizado:</div>
                <div className="font-medium">
                  {new Date(vehicleData.battery.timestamp).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Si está cargando el estado inicial
  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="ml-3">Verificando configuración de SmartCar...</span>
      </div>
    );
  }

  // Si SmartCar no está configurado correctamente
  if (!smartcarStatus?.initializedSuccessfully) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          La integración con SmartCar no está disponible en este momento. 
          Por favor, contacta al administrador.
        </AlertDescription>
      </Alert>
    );
  }

  // Si el usuario ya tiene un vehículo conectado
  if (accessToken && connectedVehicles.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Vehículo conectado con SmartCar</h3>
          <Button variant="outline" onClick={handleDisconnect}>
            Desconectar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2 bg-muted/50">
              <CardTitle className="text-md flex items-center">
                <Car className="h-4 w-4 mr-2" />
                Vehículos disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {connectedVehicles.map(vehicleId => (
                  <Button
                    key={vehicleId}
                    variant={selectedVehicle === vehicleId ? "default" : "outline"}
                    className="justify-start h-auto py-3"
                    onClick={() => fetchVehicleData(vehicleId)}
                  >
                    <div className="flex items-center">
                      <Car className="h-5 w-5 mr-2" />
                      <div>
                        {vehicleData && selectedVehicle === vehicleId && vehicleData.info
                          ? <span>{vehicleData.info.year} {vehicleData.info.make} {vehicleData.info.model}</span>
                          : <span>Vehículo {connectedVehicles.indexOf(vehicleId) + 1}</span>
                        }
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {loading && (
            <Card className="md:col-span-2 p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-muted-foreground">Cargando datos del vehículo...</p>
            </Card>
          )}
          
          {error && (
            <Alert variant="destructive" className="md:col-span-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!loading && !error && vehicleData && (
            <div className="md:col-span-2">
              {renderVehicleData()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Estado predeterminado: mostrar botón de conexión
  return (
    <div className="bg-muted/20 rounded-md p-6 border border-border">
      <div className="text-center space-y-4">
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
          <Wifi className="h-8 w-8 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold">Conecta tu vehículo</h3>
        
        <p className="text-muted-foreground">
          Conecta tu vehículo con SmartCar para obtener datos en tiempo real y diagnósticos más precisos.
        </p>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleConnect} 
          disabled={loading}
          className="mt-4"
          size="lg"
        >
          {loading ? (
            <span className="flex items-center">
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Conectando...
            </span>
          ) : (
            <span className="flex items-center">
              <Car className="mr-2 h-4 w-4" />
              Conectar vehículo con SmartCar
            </span>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground pt-4">
          SmartCar es compatible con la mayoría de vehículos fabricados después de 2015 
          que cuentan con conectividad integrada.
        </p>
      </div>
    </div>
  );
}