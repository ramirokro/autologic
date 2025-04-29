# Arquitectura de Autologic

Este documento describe la arquitectura del sistema Autologic.

## Diagrama de componentes

```
+----------------------------------+
|           CLIENTE                |
|  +----------------------------+  |
|  |  React / TypeScript        |  |
|  |                            |  |
|  |  +----------------------+  |  |
|  |  |  Componentes UI      |  |  |
|  |  |  - Terminal          |  |  |
|  |  |  - AutologicLogo     |  |  |
|  |  |  - DiagnosticChat    |  |  |
|  |  +----------------------+  |  |
|  |                            |  |
|  |  +----------------------+  |  |
|  |  |  Servicios          |  |  |
|  |  |  - Conexión OBD     |  |  |
|  |  |  - Firebase         |  |  |
|  |  |  - PDF Generator    |  |  |
|  |  +----------------------+  |  |
|  +----------------------------+  |
+----------------+----------------+
                 |
                 | HTTP/WebSocket
                 |
+----------------v----------------+
|           SERVIDOR              |
|  +----------------------------+ |
|  |  Express.js               | |
|  |  - API REST               | |
|  |  - Integración Shopify    | |
|  |  - Integración SmartCar   | |
|  +----------------------------+ |
|                                 |
|  +----------------------------+ |
|  |  FastAPI                  | |
|  |  - IA (OpenAI/Anthropic)  | |
|  |  - Procesamiento OBD      | |
|  +----------------------------+ |
|                                 |
|  +----------------------------+ |
|  |  Base de datos PostgreSQL | |
|  |  - Vehículos              | |
|  |  - Diagnósticos           | |
|  |  - Usuarios               | |
|  +----------------------------+ |
+----------------------------------+
         |              |
         |              |
+--------v-----+  +-----v--------+
|  Shopify API |  |  SmartCar API|
+--------------+  +--------------+
```

## Flujo de datos

1. **Autenticación**:
   - El usuario inicia sesión a través de Firebase Authentication
   - Se crea un token JWT para autenticar solicitudes al backend

2. **Diagnóstico**:
   - El usuario conecta un lector OBD2 vía Bluetooth al navegador
   - Los códigos OBD se envían al servidor FastAPI para análisis con IA
   - Los resultados se muestran en la interfaz del terminal

3. **Recomendación de refacciones**:
   - Basado en el diagnóstico, se consulta a la API de Shopify
   - Se filtran las refacciones compatibles con el vehículo del usuario
   - Se muestran las recomendaciones con links directos a la tienda

4. **Generación de informes**:
   - El cliente genera un PDF con el diagnóstico y recomendaciones
   - El PDF se almacena en Firebase Storage
   - Se asocia con el historial de diagnósticos del usuario

5. **Conexión de vehículos modernos**:
   - Para vehículos compatibles, se usa la API de SmartCar
   - Permite obtener datos de telemetría avanzados
   - Complementa la información del scanner OBD2

## Tecnologías principales

| Componente         | Tecnología                    |
|--------------------|-------------------------------|
| Frontend           | React, TypeScript, TailwindCSS|
| Backend REST       | Express.js, Node.js           |
| Backend IA         | FastAPI, Python               |
| Base de datos      | PostgreSQL con Drizzle ORM    |
| Autenticación      | Firebase Auth                 |
| Almacenamiento     | Firebase Storage              |
| E-commerce         | Shopify Storefront API        |
| IA                 | OpenAI API, Anthropic API     |
| Conexión vehículos | SmartCar API, Web Bluetooth   |
| Generación PDF     | jsPDF                         |

## Consideraciones de diseño

### Enfoque de microservicios
El sistema está diseñado como una serie de servicios independientes que se comunican entre sí:
- **Express API**: Gestiona autenticación, datos de usuario y conexión con Shopify
- **FastAPI**: Gestiona diagnósticos, procesamiento de IA y análisis de códigos OBD
- **Cliente React**: Proporciona la interfaz de usuario y maneja la experiencia del usuario

### Escalabilidad
- Los servicios pueden escalar horizontalmente para manejar mayor carga
- La integración con servicios en la nube (Firebase, OpenAI) permite manejar picos de demanda

### Seguridad
- Autenticación por tokens JWT
- HTTPS para todas las comunicaciones
- Entornos aislados para variables de entorno sensibles
- Validación estricta de entrada de datos

### Confiabilidad
- Estrategia de fallback para APIs externas (ej. alternancia OpenAI/Anthropic)
- Dominios alternativos para Shopify (principal y de respaldo)
- Caching de respuestas comunes para mejorar la disponibilidad