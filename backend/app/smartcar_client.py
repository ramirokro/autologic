import os
from typing import Dict, List, Optional, Union, Any
import smartcar
import json
from fastapi import HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta

# Modelos para la API de Smartcar
class VehicleInfo(BaseModel):
    id: str
    make: str
    model: str
    year: int
    vin: Optional[str] = None

class VehicleLocation(BaseModel):
    latitude: float
    longitude: float
    timestamp: str

class VehicleBattery(BaseModel):
    percent_remaining: float
    range: Optional[float] = None
    timestamp: str

class VehicleFuel(BaseModel):
    percent_remaining: float
    range: Optional[float] = None
    amount_remaining: Optional[float] = None
    timestamp: str

class VehicleOdometer(BaseModel):
    distance: float
    timestamp: str

class VehicleTirePressure(BaseModel):
    front_left: Optional[float] = None
    front_right: Optional[float] = None
    back_left: Optional[float] = None
    back_right: Optional[float] = None
    timestamp: str

class VehicleOilStatus(BaseModel):
    life_remaining: Optional[float] = None
    timestamp: str

class VehicleEngineStatus(BaseModel):
    running: bool
    timestamp: str

class DiagnosticTroubleCodes(BaseModel):
    codes: List[str]
    timestamp: str

# Configuración de Smartcar
class SmartcarConfig:
    def __init__(self):
        # Credenciales de la API
        self.client_id = os.environ.get("SMARTCAR_CLIENT_ID")
        self.client_secret = os.environ.get("SMARTCAR_CLIENT_SECRET")
        self.redirect_uri = os.environ.get("SMARTCAR_REDIRECT_URI")
        
        # Comprobar si las credenciales están configuradas
        if not self.client_id or not self.client_secret or not self.redirect_uri:
            print("⚠️ Advertencia: Credenciales de Smartcar no configuradas correctamente")
            
        # Configurar cliente de Smartcar
        self.client = smartcar.AuthClient(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
            mode="test"  # Cambiar a "live" para producción
        )
        
        # Opciones para la autorización
        self.scope = [
            "required:read_vehicle_info",
            "required:read_odometer",
            "read_location",
            "read_tires",
            "read_engine_oil",
            "read_battery",
            "read_charge",
            "read_fuel",
            "read_engine",
            "control_security",
            "read_vin"
        ]

    def get_auth_url(self, state: Optional[str] = None) -> str:
        """Genera la URL para autorización OAuth"""
        if not self.client:
            raise HTTPException(status_code=500, detail="Smartcar no está configurado correctamente")
        
        auth_url = self.client.get_auth_url(
            scope=self.scope,
            state=state
        )
        return auth_url
    
    def exchange_code(self, code: str) -> Dict[str, Any]:
        """Intercambia el código de autorización por un token de acceso"""
        if not self.client:
            raise HTTPException(status_code=500, detail="Smartcar no está configurado correctamente")
        
        try:
            access = self.client.exchange_code(code)
            return {
                "access_token": access["access_token"],
                "refresh_token": access["refresh_token"],
                "expires_in": access["expires_in"],
                "expires_at": (datetime.now() + timedelta(seconds=access["expires_in"])).isoformat()
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al intercambiar código: {str(e)}")
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Actualiza el token de acceso usando el token de actualización"""
        if not self.client:
            raise HTTPException(status_code=500, detail="Smartcar no está configurado correctamente")
        
        try:
            new_access = self.client.exchange_refresh_token(refresh_token)
            return {
                "access_token": new_access["access_token"],
                "refresh_token": new_access["refresh_token"],
                "expires_in": new_access["expires_in"],
                "expires_at": (datetime.now() + timedelta(seconds=new_access["expires_in"])).isoformat()
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al actualizar token: {str(e)}")

# Clase para interactuar con vehículos conectados
class SmartcarVehicleClient:
    def __init__(self, access_token: str):
        self.access_token = access_token
        
    async def get_vehicles(self) -> List[str]:
        """Obtiene la lista de IDs de vehículos conectados"""
        try:
            vehicles = smartcar.get_vehicles(self.access_token)
            return vehicles["vehicles"]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener vehículos: {str(e)}")
    
    async def get_vehicle_info(self, vehicle_id: str) -> VehicleInfo:
        """Obtiene información básica del vehículo"""
        try:
            vehicle = smartcar.Vehicle(vehicle_id, self.access_token)
            info = vehicle.info()
            
            # Intentar obtener el VIN si está disponible
            vin = None
            try:
                vin_response = vehicle.vin()
                vin = vin_response["vin"]
            except:
                pass
            
            return VehicleInfo(
                id=vehicle_id,
                make=info["make"],
                model=info["model"],
                year=info["year"],
                vin=vin
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener información del vehículo: {str(e)}")
    
    async def get_odometer(self, vehicle_id: str) -> VehicleOdometer:
        """Obtiene la lectura del odómetro"""
        try:
            vehicle = smartcar.Vehicle(vehicle_id, self.access_token)
            response = vehicle.odometer()
            return VehicleOdometer(
                distance=response["distance"],
                timestamp=response["timestamp"]
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener odómetro: {str(e)}")
    
    async def get_location(self, vehicle_id: str) -> VehicleLocation:
        """Obtiene la ubicación actual del vehículo"""
        try:
            vehicle = smartcar.Vehicle(vehicle_id, self.access_token)
            response = vehicle.location()
            return VehicleLocation(
                latitude=response["latitude"],
                longitude=response["longitude"],
                timestamp=response["timestamp"]
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener ubicación: {str(e)}")
    
    async def get_battery(self, vehicle_id: str) -> VehicleBattery:
        """Obtiene información de la batería para vehículos eléctricos"""
        try:
            vehicle = smartcar.Vehicle(vehicle_id, self.access_token)
            response = vehicle.battery()
            return VehicleBattery(
                percent_remaining=response["percentRemaining"],
                range=response.get("range"),
                timestamp=response["timestamp"]
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener batería: {str(e)}")
    
    async def get_fuel(self, vehicle_id: str) -> VehicleFuel:
        """Obtiene información del combustible"""
        try:
            vehicle = smartcar.Vehicle(vehicle_id, self.access_token)
            response = vehicle.fuel()
            return VehicleFuel(
                percent_remaining=response["percentRemaining"],
                range=response.get("range"),
                amount_remaining=response.get("amountRemaining"),
                timestamp=response["timestamp"]
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener combustible: {str(e)}")
    
    async def get_tire_pressure(self, vehicle_id: str) -> VehicleTirePressure:
        """Obtiene presión de neumáticos"""
        try:
            vehicle = smartcar.Vehicle(vehicle_id, self.access_token)
            response = vehicle.tire_pressure()
            return VehicleTirePressure(
                front_left=response.get("frontLeft"),
                front_right=response.get("frontRight"),
                back_left=response.get("backLeft"),
                back_right=response.get("backRight"),
                timestamp=response["timestamp"]
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener presión de neumáticos: {str(e)}")
    
    async def get_oil_status(self, vehicle_id: str) -> VehicleOilStatus:
        """Obtiene estado del aceite del motor"""
        try:
            vehicle = smartcar.Vehicle(vehicle_id, self.access_token)
            response = vehicle.engine_oil()
            return VehicleOilStatus(
                life_remaining=response.get("lifeRemaining"),
                timestamp=response["timestamp"]
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener estado del aceite: {str(e)}")
    
    async def get_engine_status(self, vehicle_id: str) -> VehicleEngineStatus:
        """Obtiene estado del motor (encendido/apagado)"""
        try:
            vehicle = smartcar.Vehicle(vehicle_id, self.access_token)
            response = vehicle.engine()
            return VehicleEngineStatus(
                running=response["running"],
                timestamp=response["timestamp"]
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener estado del motor: {str(e)}")
    
    async def get_security_status(self, vehicle_id: str) -> Dict[str, Any]:
        """Obtiene estado de seguridad (puertas, ventanas, etc.)"""
        try:
            vehicle = smartcar.Vehicle(vehicle_id, self.access_token)
            response = vehicle.security()
            return response
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener estado de seguridad: {str(e)}")
    
    async def get_complete_vehicle_status(self, vehicle_id: str) -> Dict[str, Any]:
        """Obtiene estado completo del vehículo (combina varias llamadas)"""
        try:
            result = {}
            
            # Obtener información básica
            try:
                vehicle_info = await self.get_vehicle_info(vehicle_id)
                result["info"] = vehicle_info.dict()
            except Exception as e:
                result["info"] = {"error": str(e)}
            
            # Obtener odómetro
            try:
                odometer = await self.get_odometer(vehicle_id)
                result["odometer"] = odometer.dict()
            except Exception as e:
                result["odometer"] = {"error": str(e)}
            
            # Obtener ubicación
            try:
                location = await self.get_location(vehicle_id)
                result["location"] = location.dict()
            except Exception as e:
                result["location"] = {"error": str(e)}
            
            # Obtener batería (vehículos eléctricos)
            try:
                battery = await self.get_battery(vehicle_id)
                result["battery"] = battery.dict()
            except Exception as e:
                # La batería solo está disponible en vehículos eléctricos
                result["battery"] = {"error": str(e)}
            
            # Obtener combustible
            try:
                fuel = await self.get_fuel(vehicle_id)
                result["fuel"] = fuel.dict()
            except Exception as e:
                # El combustible no está disponible en todos los vehículos
                result["fuel"] = {"error": str(e)}
            
            # Obtener presión de neumáticos
            try:
                tire_pressure = await self.get_tire_pressure(vehicle_id)
                result["tire_pressure"] = tire_pressure.dict()
            except Exception as e:
                result["tire_pressure"] = {"error": str(e)}
            
            # Obtener estado del aceite
            try:
                oil_status = await self.get_oil_status(vehicle_id)
                result["oil_status"] = oil_status.dict()
            except Exception as e:
                result["oil_status"] = {"error": str(e)}
            
            # Obtener estado del motor
            try:
                engine_status = await self.get_engine_status(vehicle_id)
                result["engine_status"] = engine_status.dict()
            except Exception as e:
                result["engine_status"] = {"error": str(e)}
            
            return result
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al obtener estado completo: {str(e)}")

# Inicializar cliente de Smartcar
smartcar_config = SmartcarConfig()