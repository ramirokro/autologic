
# AutoLogic - Diagnóstico Automotriz Inteligente

![Autologic Logo](./client/public/logo-autologic-green.png)

## Descripción

Autologic es una plataforma avanzada de diagnóstico automotriz con integración a Shopify, que utiliza inteligencia artificial para interpretar códigos OBD2 y problemas reportados por los usuarios. La plataforma ofrece una experiencia de diagnóstico automotriz completa con una interfaz de tipo terminal/consola, recomendaciones de refacciones específicas y generación de reportes PDF profesionales.

## Características principales

- **OBi-2**: Asistente virtual de diagnóstico automotriz potenciado por IA (Anthropic Claude/OpenAI)
- **Interfaz tipo terminal**: Diseño con estética de consola técnica para una experiencia de usuario única
- **Conectividad Bluetooth**: Soporte para lectores OBD2 directamente desde el navegador
- **Integración con Shopify**: Recomendaciones de refacciones específicas para cada vehículo
- **Generación de PDF**: Informes profesionales de diagnóstico con logo, datos del vehículo y recomendaciones
- **Autenticación Firebase**: Sistema de inicio de sesión seguro y robusto
- **Historial de diagnósticos**: Almacenamiento de diagnósticos previos para seguimiento
- **SmartCar API**: Conexión con vehículos compatibles para datos en tiempo real

## Tecnologías utilizadas

- **Frontend**: React.js con TypeScript, Wouter para enrutamiento, TailwindCSS para estilizado
- **Backend**: Express.js para API REST, FastAPI para servicios de IA
- **Base de datos**: PostgreSQL con Drizzle ORM
- **Autenticación**: Firebase Authentication
- **Almacenamiento**: Firebase Storage para PDF y documentos
- **APIs**: Shopify Storefront API, SmartCar API, OpenAI API, Anthropic API
- **Generación de PDF**: jsPDF y jsPDF-autotable
- **Estilos**: Shadcn/UI con TailwindCSS

## Estructura del Proyecto
- `/backend` - API FastAPI para diagnóstico automotriz con IA
- `/client` - Frontend React/TypeScript con interfaz tipo terminal
- `/server` - Servidor Express para integraciones con Shopify y SmartCar
- `/scripts` - Scripts de utilidad para importación de datos
- `/shared` - Tipos y utilidades compartidas
- `/data` - Modelos y datos para el diagnóstico automotriz

## Requisitos
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- NPM o Yarn
- Credenciales API:
  - Shopify Storefront API
  - Firebase (Auth + Storage)
  - SmartCar (opcional)
  - OpenAI/Anthropic (para asistente OBi-2)

## Configuración de Secretos

El proyecto requiere varias claves API para funcionar correctamente:

```
# Shopify
SHOPIFY_API_TOKEN=            # Token de API de Shopify Storefront
SHOPIFY_TOKEN=                # Token de acceso a la tienda

# IA
OPENAI_API_KEY=               # Clave API de OpenAI
ANTHROPIC_API_KEY=            # Clave API de Anthropic

# Firebase
VITE_FIREBASE_API_KEY=        # Clave API de Firebase
VITE_FIREBASE_PROJECT_ID=     # ID del proyecto de Firebase
VITE_FIREBASE_APP_ID=         # ID de la aplicación de Firebase

# SmartCar
SMARTCAR_CLIENT_ID=           # ID de cliente de SmartCar
SMARTCAR_CLIENT_SECRET=       # Secreto de cliente de SmartCar
SMARTCAR_REDIRECT_URI=        # URI de redirección de SmartCar

# Base de datos
DATABASE_URL=                 # URL de conexión a PostgreSQL
```

## Inicio Rápido

1. Instalar dependencias:
```bash
npm install        # Dependencias principales
cd client && npm install  # Dependencias del cliente
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Iniciar servicios:
```bash
# En Replit, solo necesitas ejecutar
npm run dev

# Para desarrollo local:
# Terminal 1 - Backend FastAPI
./start_backend.sh

# Terminal 2 - Servidor Express
npm run server

# Terminal 3 - Cliente React
cd client && npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5000
- Backend API: http://localhost:8000
- Express Server: http://localhost:3000

## Pruebas

Para ejecutar la suite de pruebas automática se utiliza `pytest`.
1. Instala las dependencias necesarias para Python:
```bash
pip install -r backend/requirements.txt pytest
```

2. Ejecuta todas las pruebas con:
```bash
pytest
```

Esto validará que los endpoints básicos del API funcionen correctamente.

## Capturas de pantalla

![Interfaz de diagnóstico](./client/public/screenshot-terminal.png)

## Equipo

Desarrollado por el equipo de Autologic

## Licencia

Todos los derechos reservados © 2025 Autologic
