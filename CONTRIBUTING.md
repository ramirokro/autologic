# Guía de contribución para Autologic

¡Gracias por tu interés en contribuir al proyecto Autologic! Esta guía te ayudará a entender cómo puedes colaborar de manera efectiva con nuestro equipo.

## Proceso de contribución

1. **Fork del repositorio**
   - Crea un fork del repositorio en tu cuenta personal de GitHub

2. **Clona tu fork**
   ```bash
   git clone https://github.com/tu-usuario/autologic.git
   cd autologic
   ```

3. **Configura el repositorio upstream**
   ```bash
   git remote add upstream https://github.com/autologic/autologic.git
   ```

4. **Crea una rama para tu contribución**
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   ```
   
5. **Realiza tus cambios**
   - Asegúrate de seguir las convenciones de código
   - Añade pruebas para las nuevas funcionalidades
   - Actualiza la documentación si es necesario

6. **Envía tu contribución**
   ```bash
   git add .
   git commit -m "feat: descripción concisa de tus cambios"
   git push origin feature/nombre-de-tu-feature
   ```

7. **Abre un Pull Request**
   - Dirígete a tu fork en GitHub y selecciona "New Pull Request"
   - Escribe una descripción detallada de tus cambios
   - Referencia cualquier issue relacionado con tu PR

## Convenciones de código

### Commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/) para nuestros mensajes de commit:

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de errores
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (espacios en blanco, etc.)
- `refactor:` - Refactorización de código
- `perf:` - Mejoras de rendimiento
- `test:` - Adición o corrección de pruebas
- `chore:` - Cambios en el proceso de construcción o herramientas auxiliares

### Estilo de código

- **JavaScript/TypeScript**: Seguimos las recomendaciones de ESLint y Prettier
- **Python**: Seguimos PEP 8
- **CSS/SCSS**: Utilizamos TailwindCSS y sus convenciones

## Reportar problemas

Si encuentras algún problema o tienes alguna sugerencia, por favor crea un issue en GitHub con los siguientes detalles:

- Descripción clara y concisa del problema
- Pasos para reproducir el problema
- Comportamiento esperado vs. comportamiento actual
- Capturas de pantalla si aplica
- Información de tu entorno (navegador, sistema operativo, etc.)

## Preguntas

Si tienes preguntas o necesitas ayuda, puedes:

- Abrir un issue con el tag "question"
- Contactar al equipo de desarrollo en desarrollo@autologic.mx

## Licencia

Al contribuir a este proyecto, aceptas que tus contribuciones estarán bajo la misma licencia que el proyecto.

¡Gracias por tu colaboración!