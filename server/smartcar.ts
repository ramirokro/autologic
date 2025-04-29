// Importamos los componentes necesarios de smartcar
import { storage } from './storage';
import { InsertSmartcarVehicleData } from '@shared/schema';
import { log } from './vite';
// Importación con destructuring para resolver problemas de ES Modules vs CommonJS
import smartcar from 'smartcar';
// @ts-ignore - Sabemos que smartcar tiene estos componentes
const AuthClient = smartcar.AuthClient;
// @ts-ignore - Sabemos que smartcar tiene estos componentes
const Vehicle = smartcar.Vehicle;

// Declaramos el cliente
let client: any = null;

/**
 * Inicializa la configuración de SmartCar
 */
export async function initializeSmartcarConfig() {
  try {
    // Verificar si hay variables de entorno configuradas
    if (process.env.SMARTCAR_CLIENT_ID && process.env.SMARTCAR_CLIENT_SECRET && process.env.SMARTCAR_REDIRECT_URI) {
      // Crear instancia del cliente usando variables de entorno
      client = new AuthClient({
        clientId: process.env.SMARTCAR_CLIENT_ID,
        clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
        redirectUri: process.env.SMARTCAR_REDIRECT_URI,
        mode: process.env.SMARTCAR_TEST_MODE === 'true' ? 'test' : 'live'
      });
      
      log(`Configuración de SmartCar inicializada desde variables de entorno`, 'smartcar');
      
      // Opcionalmente, actualizar o crear configuración en la base de datos
      try {
        const config = await storage.getSmartcarConfig();
        if (!config) {
          await storage.createSmartcarConfig({
            clientId: process.env.SMARTCAR_CLIENT_ID,
            clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
            redirectUri: process.env.SMARTCAR_REDIRECT_URI,
            testMode: process.env.SMARTCAR_TEST_MODE === 'true'
          });
          log('Configuración de SmartCar guardada en base de datos', 'smartcar');
        }
      } catch (dbError) {
        log(`Error al guardar configuración en base de datos: ${dbError}`, 'warning');
      }
      
      return true;
    }
    
    // Si no hay variables de entorno, intentar cargar desde la base de datos
    const config = await storage.getSmartcarConfig();
    
    if (!config) {
      log('Error: No se encontró configuración de SmartCar ni en variables de entorno ni en base de datos', 'error');
      return false;
    }
    
    // Crear instancia del cliente
    client = new AuthClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
      mode: config.testMode ? 'test' : 'live'
    });
    
    log(`Configuración de SmartCar inicializada desde base de datos: ${config.clientId}, modo de prueba: ${config.testMode}`, 'smartcar');
    return true;
  } catch (error) {
    log(`Error al inicializar SmartCar: ${error}`, 'error');
    return false;
  }
}

/**
 * Obtiene la URL de autorización de SmartCar
 * @param state String para mantener el estado entre la redirección
 */
export function getAuthUrl(state: string): string {
  if (!client) throw new Error('Cliente SmartCar no inicializado');
  
  // Definimos los scopes - SmartCar espera un array de strings
  const scopes = [
    'required:read_odometer',
    'required:read_vin', 
    'required:read_vehicle_info',
    'read_engine_oil',
    'read_fuel',
    'read_battery',
    'read_location',
    'read_tire_pressure',
    'read_engine',
    'control_security',
    'read_compass'
  ];
  
  // Formato compatible con smartcar v9.15.0 - pasamos scopes como primer parámetro
  // y las opciones como segundo parámetro
  return client.getAuthUrl(scopes, { state });
}

/**
 * Intercambia el código de autorización por tokens de acceso
 * @param code Código de autorización
 */
export async function exchangeCode(code: string): Promise<{ accessToken: string; refreshToken: string; expiration: number }> {
  if (!client) throw new Error('Cliente SmartCar no inicializado');
  
  const { accessToken, refreshToken, expiresIn } = await client.exchangeCode(code);
  
  // expiresIn es en segundos, lo convertimos a milisegundos y calculamos la fecha de expiración
  const expiration = Date.now() + expiresIn * 1000;
  
  return { accessToken, refreshToken, expiration };
}

/**
 * Obtiene los IDs de los vehículos del usuario
 * @param accessToken Token de acceso
 */
export async function getVehicles(accessToken: string): Promise<string[]> {
  if (!client) throw new Error('Cliente SmartCar no inicializado');
  
  const { vehicles } = await client.getVehicles(accessToken);
  return vehicles;
}

/**
 * Obtiene información básica del vehículo
 * @param vehicleId ID del vehículo
 * @param accessToken Token de acceso
 */
export async function getVehicleInfo(vehicleId: string, accessToken: string): Promise<any> {
  if (!client) throw new Error('Cliente SmartCar no inicializado');
  
  const vehicle = new Vehicle(vehicleId, accessToken);
  return await vehicle.info();
}

/**
 * Obtiene la lectura del odómetro
 * @param vehicleId ID del vehículo
 * @param accessToken Token de acceso
 */
export async function getOdometer(vehicleId: string, accessToken: string): Promise<any> {
  if (!client) throw new Error('Cliente SmartCar no inicializado');
  
  const vehicle = new Vehicle(vehicleId, accessToken);
  return await vehicle.odometer();
}

/**
 * Obtiene el estado de energía (combustible o batería)
 * @param vehicleId ID del vehículo
 * @param accessToken Token de acceso
 */
export async function getEnergyStatus(vehicleId: string, accessToken: string): Promise<any> {
  if (!client) throw new Error('Cliente SmartCar no inicializado');
  
  const vehicle = new Vehicle(vehicleId, accessToken);
  
  try {
    // Intenta obtener el nivel de combustible
    return await vehicle.fuel();
  } catch (error) {
    try {
      // Si falla, intenta obtener el nivel de batería
      return await vehicle.battery();
    } catch (innerError) {
      // Si ambos fallan, devuelve null
      return null;
    }
  }
}

/**
 * Obtiene el estado del aceite del motor
 * @param vehicleId ID del vehículo
 * @param accessToken Token de acceso
 */
export async function getEngineOil(vehicleId: string, accessToken: string): Promise<any> {
  if (!client) throw new Error('Cliente SmartCar no inicializado');
  
  const vehicle = new Vehicle(vehicleId, accessToken);
  try {
    return await vehicle.engineOil();
  } catch (error) {
    return null; // Algunos vehículos no soportan esta función
  }
}

/**
 * Obtiene la presión de los neumáticos
 * @param vehicleId ID del vehículo
 * @param accessToken Token de acceso
 */
export async function getTirePressure(vehicleId: string, accessToken: string): Promise<any> {
  if (!client) throw new Error('Cliente SmartCar no inicializado');
  
  const vehicle = new Vehicle(vehicleId, accessToken);
  try {
    return await vehicle.tirePressure();
  } catch (error) {
    return null; // Algunos vehículos no soportan esta función
  }
}

/**
 * Obtiene la ubicación del vehículo
 * @param vehicleId ID del vehículo
 * @param accessToken Token de acceso
 */
export async function getLocation(vehicleId: string, accessToken: string): Promise<any> {
  if (!client) throw new Error('Cliente SmartCar no inicializado');
  
  const vehicle = new Vehicle(vehicleId, accessToken);
  try {
    return await vehicle.location();
  } catch (error) {
    return null; // Algunos vehículos no soportan esta función
  }
}

/**
 * Recopila y guarda datos del vehículo en la base de datos
 * @param vehicleId ID del vehículo en Smartcar
 * @param accessToken Token de acceso
 * @param smartcarVehicleId ID del vehículo en nuestra base de datos
 */
export async function collectVehicleData(vehicleId: string, accessToken: string, smartcarVehicleId: number): Promise<InsertSmartcarVehicleData> {
  log(`Recopilando datos para vehículo ${vehicleId}`, 'smartcar');
  
  // Inicializar objeto de datos
  const data: InsertSmartcarVehicleData = {
    smartcarVehicleId,
    recordedAt: new Date(),
    rawData: {}
  };
  
  try {
    // Información del vehículo
    const info = await getVehicleInfo(vehicleId, accessToken);
    data.rawData = { info };
    
    // Obtener odómetro
    try {
      const odometer = await getOdometer(vehicleId, accessToken);
      data.odometer = odometer.distance;
      data.rawData = { ...data.rawData, odometer };
    } catch (error) {
      log(`Error al obtener odómetro: ${error}`, 'error');
    }
    
    // Obtener nivel de aceite
    try {
      const engineOil = await getEngineOil(vehicleId, accessToken);
      data.oilLife = engineOil?.lifeRemaining;
      data.rawData = { ...data.rawData, engineOil };
    } catch (error) {
      log(`Error al obtener nivel de aceite: ${error}`, 'error');
    }
    
    // Obtener presión de neumáticos
    try {
      const tirePressure = await getTirePressure(vehicleId, accessToken);
      data.tirePressure = JSON.stringify(tirePressure);
      data.rawData = { ...data.rawData, tirePressure };
    } catch (error) {
      log(`Error al obtener presión de neumáticos: ${error}`, 'error');
    }
    
    // Obtener estado de energía
    try {
      if (info.fuel && info.fuel.capacity > 0) {
        const fuel = await getEnergyStatus(vehicleId, accessToken);
        data.fuelPercentRemaining = fuel?.percentRemaining;
        data.rawData = { ...data.rawData, fuel };
      } else {
        const battery = await getEnergyStatus(vehicleId, accessToken);
        data.batteryPercentRemaining = battery?.percentRemaining;
        data.rawData = { ...data.rawData, battery };
      }
    } catch (error) {
      log(`Error al obtener estado de energía: ${error}`, 'error');
    }
    
    // Obtener ubicación
    try {
      const location = await getLocation(vehicleId, accessToken);
      data.location = JSON.stringify(location);
      data.rawData = { ...data.rawData, location };
    } catch (error) {
      log(`Error al obtener ubicación: ${error}`, 'error');
    }
    
    // Guardar datos en la base de datos
    const savedData = await storage.createSmartcarVehicleData(data);
    log(`Datos guardados para vehículo ${vehicleId}`, 'smartcar');
    
    return data;
  } catch (error) {
    log(`Error al recopilar datos: ${error}`, 'error');
    throw error;
  }
}

/**
 * Refresca el token de acceso usando el refresh token
 * @param refreshToken Token de actualización
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiration: number }> {
  if (!client) throw new Error('Cliente SmartCar no inicializado');
  
  const { accessToken, refreshToken: newRefreshToken, expiresIn } = await client.exchangeRefreshToken(refreshToken);
  
  // expiresIn es en segundos, lo convertimos a milisegundos y calculamos la fecha de expiración
  const expiration = Date.now() + expiresIn * 1000;
  
  return { 
    accessToken, 
    refreshToken: newRefreshToken, 
    expiration 
  };
}