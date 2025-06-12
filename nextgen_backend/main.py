from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

app = FastAPI(title="NextGen AutoDiag API")

class DiagnosticRequest(BaseModel):
    vehicle: str
    symptoms: str

class DiagnosticResponse(BaseModel):
    message: str
    insights: str

@app.get("/api/status")
def status():
    return {"status": "ok"}

@app.post("/api/diagnose", response_model=DiagnosticResponse)
def diagnose(req: DiagnosticRequest):
    # Placeholder diagnostic logic
    if not req.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms required")
    msg = f"Recibido para {req.vehicle}: {req.symptoms}"
    return DiagnosticResponse(message=msg, insights="Diagnóstico en desarrollo")
