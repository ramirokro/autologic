#!/bin/bash

echo "🚀 Iniciando Autologic - Plataforma de diagnóstico automotriz"
echo "============================================================="
echo ""

# Verificar existencia de directorios principales
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  echo "❌ Error: No se encontraron los directorios frontend o backend"
  echo "Verifique que está ejecutando este script desde el directorio raíz del proyecto"
  exit 1
fi

# Iniciar backend en background
echo "🔧 Iniciando servidor backend (FastAPI)..."
(cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) &
BACKEND_PID=$!

# Pequeña pausa para que el backend inicie
sleep 2

# Verificar que el backend esté corriendo
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "❌ Error: El servidor backend no se pudo iniciar"
  exit 1
fi

echo "✅ Servidor backend iniciado en: http://localhost:8000"
echo "   Documentación de la API: http://localhost:8000/docs"
echo ""

# Iniciar frontend
echo "🌐 Iniciando aplicación frontend (React)..."
echo "El servidor http://localhost:5000 es el servidor de producción integrado (backend+frontend)"
echo "Accede a la aplicación en: http://localhost:5000"
echo ""

# Definir función para limpiar procesos al salir
cleanup() {
  echo ""
  echo "🛑 Deteniendo servicios..."
  kill $BACKEND_PID 2>/dev/null
  echo "✅ Servidor detenido"
  exit 0
}

# Configurar trap para SIGINT (Ctrl+C)
trap cleanup SIGINT

# Mantener el script ejecutándose para mostrar logs
echo "📝 Registros del servidor (presiona Ctrl+C para detener):"
echo "--------------------------------------------------------"
tail -f backend/uvicorn.log 2>/dev/null || echo "No se puede acceder al archivo de logs"

# Este código nunca se ejecuta por el tail -f, pero si por alguna razón termina, limpiamos
cleanup