#!/bin/bash
echo "Iniciando servidor FastAPI en puerto 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
echo "Servidor FastAPI iniciado. Accede a la documentación en: http://localhost:8000/docs"