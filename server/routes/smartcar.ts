import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import * as smartcarAPI from '../smartcar';
import { storage } from '../storage';
import { InsertSmartcarVehicleData } from '@shared/schema';
import { log } from '../vite';

const router = express.Router();

// Inicio del proceso de autorización Smartcar
router.get('/auth', isAuthenticated, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  
  try {
    // Configurar la URL de autorización con el ID de usuario como state
    const state = `user_${req.user.id}`;
    
    // Prueba de debugging - vamos a crear directamente la URL de autorización
    // usando la función auxiliar
    let authUrl;
    
    try {
      // Utilizamos la función ya corregida
      authUrl = smartcarAPI.getAuthUrl(state);
      console.log('⭐️ Generada URL de autorización:', authUrl);
    } catch (e: any) {
      console.error('⚠️ Error al generar URL:', e);
      return res.status(500).json({ 
        message: `Error al iniciar autenticación: ${e.message}`,
        stack: process.env.NODE_ENV === 'production' ? undefined : e.stack
      });
    }
    
    res.json({ authUrl });
  } catch (error: any) {
    console.error('Error al iniciar autenticación SmartCar:', error);
    res.status(500).json({ 
      message: `Error al iniciar autenticación: ${error.message}`,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// Callback tras autorización de Smartcar
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ message: 'Parámetros faltantes en la respuesta de SmartCar' });
    }
    
    // Extraer el ID de usuario del state
    const stateStr = state as string;
    const userIdMatch = stateStr.match(/^user_(\d+)$/);
    
    if (!userIdMatch) {
      return res.status(400).json({ message: 'State inválido' });
    }
    
    const userId = parseInt(userIdMatch[1], 10);
    
    // Intercambiar código por tokens
    const { accessToken, refreshToken, expiration } = await smartcarAPI.exchangeCode(code as string);
    
    // Obtener información del vehículo
    const vehicleIds = await smartcarAPI.getVehicles(accessToken);
    
    if (vehicleIds.length === 0) {
      return res.status(404).json({ message: 'No se encontraron vehículos' });
    }
    
    // Por simplicidad, tomamos el primer vehículo
    const vehicleId = vehicleIds[0];
    const vehicleInfo = await smartcarAPI.getVehicleInfo(vehicleId, accessToken);
    
    // Verificar si el vehículo ya existe en la base de datos
    const existingVehicles = await storage.getSmartcarVehicles(userId);
    const existingVehicle = existingVehicles.find(v => v.vehicleId === vehicleId);
    
    if (existingVehicle) {
      // Actualizar el vehículo existente
      await storage.updateSmartcarVehicle(existingVehicle.id, {
        accessToken,
        refreshToken,
        tokenExpiryDate: new Date(expiration),
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: vehicleInfo.year,
        vin: vehicleInfo.vin
      });
      
      // Obtener y guardar datos actualizados del vehículo
      await smartcarAPI.collectVehicleData(vehicleId, accessToken, existingVehicle.id);
      
      // Redireccionar al cliente
      return res.redirect(`/vehiculos/${existingVehicle.id}/detalles?success=1`);
    } else {
      // Guardar el vehículo en la base de datos
      const savedVehicle = await storage.createSmartcarVehicle({
        userId,
        vehicleId: vehicleId,
        accessToken,
        refreshToken,
        tokenExpiryDate: new Date(expiration),
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: vehicleInfo.year,
        vin: vehicleInfo.vin
      });
      
      // Obtener y guardar datos iniciales del vehículo
      await smartcarAPI.collectVehicleData(vehicleId, accessToken, savedVehicle.id);
      
      // Redireccionar al cliente
      return res.redirect(`/vehiculos/${savedVehicle.id}/detalles?success=1`);
    }
    
  } catch (error: any) {
    console.error('Error en callback de SmartCar:', error);
    // Redirigir con error
    return res.redirect('/vehiculos?error=smartcar_callback');
  }
});

// Obtener vehículos conectados del usuario
router.get('/vehicles', isAuthenticated, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  
  // Verificar si hay un token de acceso en la URL (para compatibilidad con el frontend)
  const accessToken = req.query.access_token as string;
  
  try {
    const vehicles = await storage.getSmartcarVehicles(req.user.id);
    
    // Adaptar la respuesta al formato que espera el frontend
    // El frontend espera un array de IDs, no objetos completos
    const vehicleIds = vehicles.map(v => v.id.toString());
    
    res.json({ vehicles: vehicleIds });
  } catch (error: any) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ message: `Error al obtener vehículos: ${error.message}` });
  }
});

// Obtener datos de un vehículo específico
router.get('/vehicles/:id', isAuthenticated, async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    
    if (isNaN(vehicleId)) {
      return res.status(400).json({ message: 'ID de vehículo no válido' });
    }
    
    // Obtener el vehículo
    const vehicle = await storage.getSmartcarVehicleById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }
    
    // Verificar que el vehículo pertenece al usuario
    if (vehicle.userId !== req.user?.id) {
      return res.status(403).json({ message: 'No tienes permiso para acceder a este vehículo' });
    }
    
    // Obtener los datos más recientes
    const data = await storage.getSmartcarVehicleLatestData(vehicleId);
    
    if (!data) {
      return res.status(404).json({ message: 'No hay datos disponibles para este vehículo' });
    }
    
    // Verificar si el token ha expirado
    const now = new Date();
    if (vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < now) {
      try {
        // Intentar refrescar el token
        const { accessToken, refreshToken, expiration } = await smartcarAPI.refreshAccessToken(vehicle.refreshToken || "");
        
        // Actualizar el vehículo con los nuevos tokens
        await storage.updateSmartcarVehicle(vehicle.id, {
          accessToken,
          refreshToken,
          tokenExpiryDate: new Date(expiration)
        });
        
        // Actualizar el vehículo en la variable local
        vehicle.accessToken = accessToken;
      } catch (error: any) {
        console.error('Error al refrescar token:', error);
        return res.status(401).json({ message: 'La conexión con el vehículo ha expirado. Por favor, vuelve a conectar el vehículo.' });
      }
    }
    
    // Actualizar los datos del vehículo en segundo plano
    smartcarAPI.collectVehicleData(vehicle.vehicleId, vehicle.accessToken || "", vehicle.id)
      .catch(error => {
        console.error('Error al actualizar datos del vehículo:', error);
      });
    
    // Devolver los datos al cliente
    res.json({
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin
      },
      data: {
        odometer: data.odometer,
        oilLife: data.oilLife,
        fuelPercentRemaining: data.fuelPercentRemaining,
        batteryPercentRemaining: data.batteryPercentRemaining,
        location: data.location ? JSON.parse(data.location as string) : null,
        lastUpdated: data.recordedAt,
        tirePressure: data.tirePressure ? JSON.parse(data.tirePressure as string) : null,
        checkEngineLight: data.checkEngineLight,
        activeDtcs: data.activeDtcs
      }
    });
    
  } catch (error: any) {
    console.error('Error al obtener datos del vehículo:', error);
    res.status(500).json({ message: `Error al obtener datos: ${error.message}` });
  }
});

// Actualizar datos del vehículo manualmente
router.post('/vehicles/:id/refresh', isAuthenticated, async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    
    if (isNaN(vehicleId)) {
      return res.status(400).json({ message: 'ID de vehículo no válido' });
    }
    
    // Obtener el vehículo
    const vehicle = await storage.getSmartcarVehicleById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }
    
    // Verificar que el vehículo pertenece al usuario
    if (vehicle.userId !== req.user?.id) {
      return res.status(403).json({ message: 'No tienes permiso para acceder a este vehículo' });
    }
    
    // Verificar si el token ha expirado
    const now = new Date();
    if (vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < now) {
      try {
        // Intentar refrescar el token
        const { accessToken, refreshToken, expiration } = await smartcarAPI.refreshAccessToken(vehicle.refreshToken || "");
        
        // Actualizar el vehículo con los nuevos tokens
        await storage.updateSmartcarVehicle(vehicle.id, {
          accessToken,
          refreshToken,
          tokenExpiryDate: new Date(expiration)
        });
        
        // Actualizar el vehículo en la variable local
        vehicle.accessToken = accessToken;
      } catch (error: any) {
        console.error('Error al refrescar token:', error);
        return res.status(401).json({ message: 'La conexión con el vehículo ha expirado. Por favor, vuelve a conectar el vehículo.' });
      }
    }
    
    // Recopilar datos actualizados del vehículo
    const data = await smartcarAPI.collectVehicleData(vehicle.vehicleId, vehicle.accessToken || "", vehicle.id);
    
    // Devolver los datos actualizados al cliente
    res.json({
      success: true,
      message: 'Datos del vehículo actualizados correctamente',
      data: {
        odometer: data.odometer,
        oilLife: data.oilLife,
        fuelPercentRemaining: data.fuelPercentRemaining,
        batteryPercentRemaining: data.batteryPercentRemaining,
        location: data.location ? JSON.parse(data.location as string) : null,
        lastUpdated: data.recordedAt,
        tirePressure: data.tirePressure ? JSON.parse(data.tirePressure as string) : null,
        checkEngineLight: data.checkEngineLight,
        activeDtcs: data.activeDtcs
      }
    });
    
  } catch (error: any) {
    console.error('Error al actualizar datos del vehículo:', error);
    res.status(500).json({ message: `Error al actualizar datos: ${error.message}` });
  }
});

// Ruta de diagnóstico para verificar la integración de SmartCar
router.get('/status', async (req, res) => {
  try {
    // Verificar la importación de Smartcar
    const smartcarModule = await import('smartcar');
    const smartcarType = typeof smartcarModule.default;
    
    // Verificar las credenciales
    const credentials = {
      clientId: process.env.SMARTCAR_CLIENT_ID ? 'Configurado' : 'No configurado',
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET ? 'Configurado' : 'No configurado',
      redirectUri: process.env.SMARTCAR_REDIRECT_URI ? 'Configurado' : 'No configurado'
    };
    
    // Información de diagnóstico
    const diagnostics = {
      smartcarModule: {
        type: smartcarType,
        // Inspección interna del objeto Smartcar para depuración
        objectKeys: Object.keys(smartcarAPI),
        moduleInfo: {
          name: 'smartcar',
          version: 'Verificar package.json'
        }
      },
      credentials,
      environment: {
        nodeVersion: process.version,
        platform: process.platform
      }
    };
    
    res.json({
      status: 'Diagnóstico completado',
      initializedSuccessfully: !!smartcarAPI.getAuthUrl,
      diagnostics
    });
  } catch (error: any) {
    console.error('Error en diagnóstico de SmartCar:', error);
    res.status(500).json({
      status: 'Error en diagnóstico',
      error: error.message
    });
  }
});

// Desconectar un vehículo
router.delete('/vehicles/:id', isAuthenticated, async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    
    if (isNaN(vehicleId)) {
      return res.status(400).json({ message: 'ID de vehículo no válido' });
    }
    
    // Obtener el vehículo
    const vehicle = await storage.getSmartcarVehicleById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }
    
    // Verificar que el vehículo pertenece al usuario
    if (vehicle.userId !== req.user?.id) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este vehículo' });
    }
    
    // Eliminar el vehículo y sus datos
    const deleted = await storage.deleteSmartcarVehicle(vehicleId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Error al eliminar el vehículo' });
    }
    
    res.json({ success: true, message: 'Vehículo desconectado correctamente' });
    
  } catch (error: any) {
    console.error('Error al desconectar vehículo:', error);
    res.status(500).json({ message: `Error al desconectar vehículo: ${error.message}` });
  }
});

// Obtener todos los datos de un vehículo para compatibilidad con el frontend
router.get('/vehicles/:id/all', isAuthenticated, async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    
    if (isNaN(vehicleId)) {
      return res.status(400).json({ message: 'ID de vehículo no válido' });
    }
    
    // Verificar si hay un token de acceso en la URL (para compatibilidad con el frontend)
    const accessToken = req.query.access_token as string;
    
    // Obtener el vehículo
    const vehicle = await storage.getSmartcarVehicleById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }
    
    // Verificar que el vehículo pertenece al usuario
    if (vehicle.userId !== req.user?.id) {
      return res.status(403).json({ message: 'No tienes permiso para acceder a este vehículo' });
    }
    
    // Obtener los datos más recientes
    const data = await storage.getSmartcarVehicleLatestData(vehicleId);
    
    if (!data) {
      return res.status(404).json({ message: 'No hay datos disponibles para este vehículo' });
    }
    
    // Verificar si el token ha expirado
    const now = new Date();
    if (vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < now) {
      try {
        // Intentar refrescar el token
        const { accessToken, refreshToken, expiration } = await smartcarAPI.refreshAccessToken(vehicle.refreshToken || "");
        
        // Actualizar el vehículo con los nuevos tokens
        await storage.updateSmartcarVehicle(vehicle.id, {
          accessToken,
          refreshToken,
          tokenExpiryDate: new Date(expiration)
        });
        
        // Actualizar el vehículo en la variable local
        vehicle.accessToken = accessToken;
      } catch (error: any) {
        console.error('Error al refrescar token:', error);
        return res.status(401).json({ message: 'La conexión con el vehículo ha expirado. Por favor, vuelve a conectar el vehículo.' });
      }
    }
    
    // Formatear los datos como los espera el frontend
    const responseData = {
      info: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin
      },
      // Formatear adecuadamente para que coincida con lo que espera el frontend
      odometer: data.odometer ? {
        distance: data.odometer,
        timestamp: data.recordedAt.toISOString()
      } : null,
      fuel: data.fuelPercentRemaining ? {
        percent_remaining: data.fuelPercentRemaining / 100, // Convertir a decimal
        timestamp: data.recordedAt.toISOString()
      } : null,
      battery: data.batteryPercentRemaining ? {
        percent_remaining: data.batteryPercentRemaining / 100, // Convertir a decimal
        timestamp: data.recordedAt.toISOString()
      } : null,
      oil: data.oilLife ? {
        life_remaining: data.oilLife / 100,
        timestamp: data.recordedAt.toISOString()
      } : null,
      tirePressure: data.tirePressure ? {
        ...JSON.parse(data.tirePressure as string),
        timestamp: data.recordedAt.toISOString()
      } : null
    };
    
    res.json(responseData);
    
    // Actualizar los datos en segundo plano
    smartcarAPI.collectVehicleData(vehicle.vehicleId, vehicle.accessToken || "", vehicle.id)
      .catch(error => {
        console.error('Error al actualizar datos del vehículo:', error);
      });
      
  } catch (error: any) {
    console.error('Error al obtener todos los datos del vehículo:', error);
    res.status(500).json({ message: `Error al obtener datos: ${error.message}` });
  }
});

// Refrescar token de acceso
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ message: 'Token de actualización no proporcionado' });
    }
    
    // Usar la API de Smartcar para refrescar el token
    const { accessToken, refreshToken, expiration } = await smartcarAPI.refreshAccessToken(refresh_token);
    
    // Devolver los nuevos tokens al cliente
    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiration
    });
    
  } catch (error: any) {
    console.error('Error al refrescar token:', error);
    res.status(500).json({ message: `Error al refrescar token: ${error.message}` });
  }
});

// Intercambiar código de autorización por tokens
router.post('/exchange', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Código de autorización no proporcionado' });
    }
    
    // Intercambiar el código por tokens
    const { accessToken, refreshToken, expiration } = await smartcarAPI.exchangeCode(code as string);
    
    // Devolver los tokens al cliente
    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiration
    });
    
  } catch (error: any) {
    console.error('Error al intercambiar código:', error);
    res.status(500).json({ message: `Error al intercambiar código: ${error.message}` });
  }
});

export default router;