from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
import anthropic
from .smartcar_client import smartcar_config, SmartcarVehicleClient

# Inicializar FastAPI
app = FastAPI(title="Autologic API", description="API para diagnóstico automotriz con Claude AI")

# Configurar CORS para permitir peticiones del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic para validación de datos
class VehicleInfo(BaseModel):
    year: int
    make: str
    model: str
    engine: Optional[str] = None

class DiagnosticRequest(BaseModel):
    vehicle: VehicleInfo
    symptoms: str
    code: Optional[str] = None
    language: Optional[str] = "es"

class DiagnosticResponse(BaseModel):
    analysis: str
    recommended_actions: List[str]
    possible_causes: List[str]
    severity: str
    parts: List[Dict[str, Any]]

# Cliente de Anthropic (Claude)
client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

# Verificar que la clave API esté configurada
@app.get("/api/status")
def check_status():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return {"status": "error", "message": "ANTHROPIC_API_KEY no está configurada"}
    return {"status": "ok", "message": "API lista para usar"}

# Endpoint para obtener diagnóstico
@app.post("/api/diagnose", response_model=DiagnosticResponse)
async def get_diagnostic(request: DiagnosticRequest):
    try:
        # Construir el prompt para Claude
        vehicle_info = f"{request.vehicle.year} {request.vehicle.make} {request.vehicle.model}"
        if request.vehicle.engine:
            vehicle_info += f" {request.vehicle.engine}"
        
        language = "español" if request.language == "es" else "inglés"
        
        # Construir el sistema prompt para Claude
        system_prompt = f"""
        Eres un mecánico automotriz experto especializado en diagnóstico de vehículos.
        Tu tarea es analizar los síntomas y/o códigos OBD-II proporcionados por el usuario y ofrecer un diagnóstico detallado.
        Debes responder únicamente en {language}.
        
        Para cada diagnóstico, debes proporcionar:
        1. Un análisis detallado del problema
        2. Una lista de posibles causas
        3. Acciones recomendadas para solucionar el problema
        4. Nivel de severidad (Bajo, Medio, Alto, Crítico)
        5. Piezas que podrían necesitar reemplazo

        Tu respuesta debe estar estrictamente estructurada en formato JSON con las siguientes claves:
        {
            "analysis": "texto detallado explicando el problema",
            "possible_causes": ["causa 1", "causa 2", ...],
            "recommended_actions": ["acción 1", "acción 2", ...],
            "severity": "nivel de severidad",
            "parts": [
                {"name": "nombre de la pieza", "description": "descripción breve", "urgency": "urgencia de reemplazo"}
            ]
        }
        
        No incluyas información adicional fuera de este formato JSON. Sé preciso y utiliza terminología técnica apropiada.
        """
        
        # Crear el mensaje del usuario
        user_message = f"Vehículo: {vehicle_info}\n"
        
        if request.code:
            user_message += f"Código de error: {request.code}\n"
        
        user_message += f"Síntomas: {request.symptoms}\n"
        user_message += "\nPor favor, proporciona un diagnóstico detallado."
        
        # Llamar a la API de Claude
        response = client.messages.create(
            model="claude-3-7-sonnet-20250219",  # Usar el modelo más reciente de Claude
            system=system_prompt,
            max_tokens=2000,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        
        # Extraer el contenido de la respuesta
        response_text = response.content[0].text
        
        # Parsear el JSON de la respuesta
        try:
            diagnostic_data = json.loads(response_text)
            return diagnostic_data
        except json.JSONDecodeError:
            # Si la respuesta no es un JSON válido, intentar extraer la parte JSON
            import re
            json_match = re.search(r'{[\s\S]*}', response_text)
            if json_match:
                try:
                    diagnostic_data = json.loads(json_match.group(0))
                    return diagnostic_data
                except:
                    pass
            
            # Si todo falla, devolver un error
            raise HTTPException(status_code=500, detail="No se pudo procesar la respuesta del modelo")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el diagnóstico: {str(e)}")

# Rutas para vehículos
from . import db

@app.get("/api/vehicles")
def get_vehicles(limit: int = 100, offset: int = 0):
    vehicles = db.get_all_vehicles(limit, offset)
    return vehicles

@app.get("/api/vehicles/count")
def count_vehicles():
    count = db.count_vehicles()
    return {"count": count}

@app.get("/api/vehicles/years")
def get_vehicle_years():
    years = db.get_vehicle_years()
    return years

@app.get("/api/vehicles/makes")
def get_vehicle_makes(year: Optional[int] = None):
    makes = db.get_vehicle_makes(year)
    return makes

@app.get("/api/vehicles/models")
def get_vehicle_models(year: Optional[int] = None, make: Optional[str] = None):
    models = db.get_vehicle_models(year, make)
    return models

@app.get("/api/vehicles/engines")
def get_vehicle_engines(year: Optional[int] = None, make: Optional[str] = None, model: Optional[str] = None):
    engines = db.get_vehicle_engines(year, make, model)
    return engines

@app.get("/api/vehicles/details")
def get_vehicle_details(year: int, make: str, model: str, engine: Optional[str] = None):
    vehicle = db.get_vehicle_by_attributes(year, make, model, engine)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return vehicle

# Modelos para SmartCar API
class SmartcarAuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    expires_at: str

class SmartcarVehicleRequest(BaseModel):
    vehicle_id: str

# Rutas para SmartCar
@app.get("/api/smartcar/status")
def smartcar_status():
    """Verificar el estado de la configuración de SmartCar"""
    status = {
        "configured": bool(os.environ.get("SMARTCAR_CLIENT_ID") and 
                          os.environ.get("SMARTCAR_CLIENT_SECRET") and 
                          os.environ.get("SMARTCAR_REDIRECT_URI"))
    }
    
    if status["configured"]:
        status["message"] = "SmartCar API está configurada correctamente"
        status["redirect_uri"] = os.environ.get("SMARTCAR_REDIRECT_URI")
    else:
        status["message"] = "SmartCar API no está configurada correctamente"
        missing = []
        if not os.environ.get("SMARTCAR_CLIENT_ID"):
            missing.append("SMARTCAR_CLIENT_ID")
        if not os.environ.get("SMARTCAR_CLIENT_SECRET"):
            missing.append("SMARTCAR_CLIENT_SECRET")
        if not os.environ.get("SMARTCAR_REDIRECT_URI"):
            missing.append("SMARTCAR_REDIRECT_URI")
        status["missing"] = missing
    
    return status

@app.get("/api/smartcar/auth")
def get_auth_url(state: Optional[str] = None):
    """Generar URL de autorización para SmartCar"""
    try:
        auth_url = smartcar_config.get_auth_url(state)
        return {"auth_url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar URL de autorización: {str(e)}")

@app.get("/api/smartcar/callback")
async def smartcar_callback(code: str, state: Optional[str] = None):
    """Callback para el flujo de autorización de SmartCar"""
    try:
        # Intercambiar código por token
        tokens = smartcar_config.exchange_code(code)
        
        # En una aplicación real, guardaríamos los tokens en la base de datos
        # asociados con la sesión o usuario actual
        
        # Redirigir al frontend con un mensaje de éxito
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(url=f"{frontend_url}/connected?success=true")
    except Exception as e:
        # Redirigir al frontend con un mensaje de error
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(url=f"{frontend_url}/connected?error={str(e)}")

@app.post("/api/smartcar/exchange", response_model=SmartcarAuthResponse)
async def exchange_code(code: str):
    """Intercambiar código de autorización por tokens"""
    try:
        tokens = smartcar_config.exchange_code(code)
        return tokens
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al intercambiar código: {str(e)}")

@app.post("/api/smartcar/refresh", response_model=SmartcarAuthResponse)
async def refresh_token(refresh_token: str):
    """Actualizar token de acceso"""
    try:
        tokens = smartcar_config.refresh_access_token(refresh_token)
        return tokens
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar token: {str(e)}")

@app.get("/api/smartcar/vehicles")
async def get_vehicles(access_token: str):
    """Obtener lista de vehículos conectados"""
    try:
        client = SmartcarVehicleClient(access_token)
        vehicles = await client.get_vehicles()
        return {"vehicles": vehicles}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener vehículos: {str(e)}")

@app.get("/api/smartcar/vehicles/{vehicle_id}/info")
async def get_vehicle_info(vehicle_id: str, access_token: str):
    """Obtener información básica del vehículo"""
    try:
        client = SmartcarVehicleClient(access_token)
        info = await client.get_vehicle_info(vehicle_id)
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener información del vehículo: {str(e)}")

@app.get("/api/smartcar/vehicles/{vehicle_id}/odometer")
async def get_vehicle_odometer(vehicle_id: str, access_token: str):
    """Obtener lectura del odómetro"""
    try:
        client = SmartcarVehicleClient(access_token)
        odometer = await client.get_odometer(vehicle_id)
        return odometer
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener odómetro: {str(e)}")

@app.get("/api/smartcar/vehicles/{vehicle_id}/location")
async def get_vehicle_location(vehicle_id: str, access_token: str):
    """Obtener ubicación del vehículo"""
    try:
        client = SmartcarVehicleClient(access_token)
        location = await client.get_location(vehicle_id)
        return location
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener ubicación: {str(e)}")

@app.get("/api/smartcar/vehicles/{vehicle_id}/fuel")
async def get_vehicle_fuel(vehicle_id: str, access_token: str):
    """Obtener nivel de combustible"""
    try:
        client = SmartcarVehicleClient(access_token)
        fuel = await client.get_fuel(vehicle_id)
        return fuel
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener nivel de combustible: {str(e)}")

@app.get("/api/smartcar/vehicles/{vehicle_id}/battery")
async def get_vehicle_battery(vehicle_id: str, access_token: str):
    """Obtener estado de la batería"""
    try:
        client = SmartcarVehicleClient(access_token)
        battery = await client.get_battery(vehicle_id)
        return battery
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener estado de la batería: {str(e)}")

@app.get("/api/smartcar/vehicles/{vehicle_id}/tires")
async def get_vehicle_tires(vehicle_id: str, access_token: str):
    """Obtener presión de neumáticos"""
    try:
        client = SmartcarVehicleClient(access_token)
        tires = await client.get_tire_pressure(vehicle_id)
        return tires
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener presión de neumáticos: {str(e)}")

@app.get("/api/smartcar/vehicles/{vehicle_id}/oil")
async def get_vehicle_oil(vehicle_id: str, access_token: str):
    """Obtener estado del aceite"""
    try:
        client = SmartcarVehicleClient(access_token)
        oil = await client.get_oil_status(vehicle_id)
        return oil
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener estado del aceite: {str(e)}")

@app.get("/api/smartcar/vehicles/{vehicle_id}/engine")
async def get_vehicle_engine(vehicle_id: str, access_token: str):
    """Obtener estado del motor"""
    try:
        client = SmartcarVehicleClient(access_token)
        engine = await client.get_engine_status(vehicle_id)
        return engine
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener estado del motor: {str(e)}")

@app.get("/api/smartcar/vehicles/{vehicle_id}/all")
async def get_all_vehicle_data(vehicle_id: str, access_token: str):
    """Obtener todos los datos disponibles del vehículo"""
    try:
        client = SmartcarVehicleClient(access_token)
        data = await client.get_complete_vehicle_status(vehicle_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener datos del vehículo: {str(e)}")

# Para desarrollo local
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)