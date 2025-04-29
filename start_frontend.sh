#!/bin/bash

echo "🚀 Iniciando aplicación frontend de Autologic..."
echo "La aplicación estará disponible en http://localhost:3000"
echo ""

# Verificar que hay una versión de Node.js instalada
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    exit 1
fi

# Ir al directorio del frontend
cd frontend

# Configurar API y proxy
export REACT_APP_API_URL="http://localhost:8000"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Iniciar el servidor de desarrollo
echo "💻 Iniciando servidor de desarrollo..."
npm start