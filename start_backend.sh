#!/bin/bash

# Verificar variables de entorno
echo "Verificando configuración de SmartCar..."
if [ -z "$SMARTCAR_CLIENT_ID" ] || [ -z "$SMARTCAR_CLIENT_SECRET" ] || [ -z "$SMARTCAR_REDIRECT_URI" ]; then
  echo "⚠️ Advertencia: SmartCar no está configurado completamente. La integración podría no funcionar."
  echo "Variables faltantes:"
  [ -z "$SMARTCAR_CLIENT_ID" ] && echo "- SMARTCAR_CLIENT_ID"
  [ -z "$SMARTCAR_CLIENT_SECRET" ] && echo "- SMARTCAR_CLIENT_SECRET"
  [ -z "$SMARTCAR_REDIRECT_URI" ] && echo "- SMARTCAR_REDIRECT_URI"
  echo ""
else
  echo "✅ SmartCar configurado correctamente."
fi

echo "Verificando configuración de Anthropic..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "⚠️ Advertencia: ANTHROPIC_API_KEY no está configurada. Los diagnósticos IA no funcionarán."
else
  echo "✅ Anthropic API configurada correctamente."
fi

echo "Verificando configuración de base de datos..."
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ Advertencia: DATABASE_URL no está configurada. Las consultas a vehículos no funcionarán."
else
  echo "✅ Base de datos configurada correctamente."
fi

# Configurar URL del frontend para redirecciones
if [ -z "$FRONTEND_URL" ]; then
  export FRONTEND_URL="http://localhost:3000"
  echo "Configurando FRONTEND_URL: $FRONTEND_URL"
fi

echo ""
echo "🚀 Iniciando servidor FastAPI en http://localhost:8000"
echo "La documentación de la API está disponible en http://localhost:8000/docs"
echo ""

# Iniciar el servidor
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000