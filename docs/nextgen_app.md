# NextGen AutoDiag - Diseño de producto

## Nombre del producto
**NextGen AutoDiag**

## Problema que resuelve
Los talleres y dueños de vehículos necesitan diagnósticos rápidos y precisos. Las soluciones actuales requieren herramientas costosas o carecen de análisis inteligente.

## Enfoque diferencial
- Plataforma web con experiencia tipo asistente conversacional.
- Integración de datos OBD2 y telemetría en la nube.
- Motor de IA que aprende de historiales anónimos para mejorar la precisión.

## Arquitectura (resumen)
```
Usuario Web/Móvil
       |
   API Gateway (GraphQL)
       |
 +-----+---------------------------+
 | Servicios Backend (Docker)      |
 |  - Servicio IA (Python + FastAPI)
 |  - Servicio Datos (Node.js)     |
 |  - Servicio Autenticación       |
 +--------------------------------+
       |
Base de Datos PostgreSQL (Cloud)
       |
Servicios externos (SmartCar API, proveedores OBD2)
```

## Tecnologías elegidas
- **Frontend:** React + TypeScript con Vite.
- **Backend:** Microservicios en Docker usando FastAPI (IA) y Node.js/Express (datos y autenticación).
- **Base de datos:** PostgreSQL administrado (ej. Supabase).
- **IA:** Modelos open-source (Transformers) alojados en GPU Cloud.
- **Infraestructura:** Kubernetes en GCP para escalar cada servicio.

## Funciones clave del MVP
1. Registro e inicio de sesión seguro.
2. Conexión con lector OBD2 vía Bluetooth/WebUSB.
3. Chat de diagnóstico con IA.
4. Historial de diagnósticos y reportes en PDF.
5. Panel de administración para talleres.

## Implementación de la IA
- Uso de un modelo LLM afinado con información automotriz.
- Pipeline que combina códigos OBD2, datos de sensores y preguntas del usuario.
- Entrenamiento incremental con feedback anónimo de resultados.

## Flujos UX principales
1. **Registro:** email o cuenta de Google; aceptación de términos.
2. **Conectar vehículo:** guía paso a paso para vincular el lector OBD2.
3. **Ejecutar diagnóstico:** pantalla de chat que muestra en tiempo real los códigos y respuestas de la IA.
4. **Resultados:** resumen con severidad, recomendaciones y botón para descargar PDF.
5. **Historial:** lista de diagnósticos anteriores con filtros por vehículo y fecha.

## Monetización
- Suscripción mensual para talleres (uso ilimitado y reportes avanzados).
- Plan freemium para usuarios individuales con límites de diagnósticos.
- Marketplace de refacciones asociado a cada resultado.

## Estrategia de despliegue y mantenimiento
- Despliegue continuo en Kubernetes usando GitHub Actions.
- Monitoreo con Prometheus y Grafana.
- Backups automáticos de base de datos.
- Actualización frecuente del modelo de IA según feedback de usuarios.

