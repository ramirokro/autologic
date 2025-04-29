#!/bin/bash

# Script para inicializar el repositorio Git y subirlo a GitHub
# Uso: ./scripts/init-github.sh <github_username> <repository_name>

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

if [ $# -ne 2 ]; then
  echo -e "${RED}Error: Faltan parámetros${NC}"
  echo -e "Uso: ./scripts/init-github.sh <github_username> <repository_name>"
  exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME=$2

echo -e "${BLUE}Inicializando repositorio Git para Autologic...${NC}"

# Verificar si git está instalado
if ! command -v git &> /dev/null; then
  echo -e "${RED}Git no está instalado. Por favor, instala Git antes de continuar.${NC}"
  exit 1
fi

# Verificar si el directorio .git ya existe
if [ -d ".git" ]; then
  echo -e "${YELLOW}Ya existe un repositorio Git en este directorio.${NC}"
  echo -e "¿Deseas eliminarlo y crear uno nuevo? (s/n)"
  read -r response
  if [ "$response" = "s" ]; then
    rm -rf .git
    echo -e "${GREEN}Repositorio Git eliminado.${NC}"
  else
    echo -e "${YELLOW}Operación cancelada.${NC}"
    exit 0
  fi
fi

# Inicializar repositorio Git
git init
echo -e "${GREEN}Repositorio Git inicializado correctamente.${NC}"

# Añadir archivos al repositorio
git add .
echo -e "${GREEN}Archivos añadidos al repositorio.${NC}"

# Realizar el primer commit
git commit -m "Initial commit: Autologic - Sistema de Diagnóstico Automotriz Inteligente"
echo -e "${GREEN}Primer commit realizado.${NC}"

# Configurar la rama principal como 'main'
git branch -M main
echo -e "${GREEN}Rama principal configurada como 'main'.${NC}"

# Añadir el repositorio remoto
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
echo -e "${GREEN}Repositorio remoto añadido:${NC} https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo -e "${YELLOW}¿Deseas subir el código ahora? (s/n)${NC}"
read -r response
if [ "$response" = "s" ]; then
  # Subir el código al repositorio remoto
  git push -u origin main
  echo -e "${GREEN}¡Código subido a GitHub correctamente!${NC}"
  echo -e "${BLUE}Tu repositorio está disponible en:${NC} https://github.com/$GITHUB_USERNAME/$REPO_NAME"
else
  echo -e "${YELLOW}El código no ha sido subido a GitHub.${NC}"
  echo -e "${BLUE}Para subirlo más tarde, ejecuta:${NC} git push -u origin main"
fi

echo -e "${GREEN}Proceso completado.${NC}"