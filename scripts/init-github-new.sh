#!/bin/bash

# Script para inicializar y subir el código a un nuevo repositorio de GitHub
# Uso: ./init-github-new.sh <nombre-usuario> <nombre-repo>

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que se proporcionaron los argumentos necesarios
if [ "$#" -ne 2 ]; then
    echo -e "${RED}Error: Se requieren dos argumentos.${NC}"
    echo -e "${YELLOW}Uso: $0 <nombre-usuario> <nombre-repo>${NC}"
    exit 1
fi

GITHUB_USER=$1
REPO_NAME=$2
GITHUB_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}Iniciando proceso de subida a GitHub${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}Usuario:${NC} $GITHUB_USER"
echo -e "${YELLOW}Repositorio:${NC} $REPO_NAME"
echo -e "${YELLOW}URL del repositorio:${NC} $GITHUB_URL"
echo -e "${BLUE}================================================${NC}"

# Comprobar si ya existe una configuración git
if [ -d ".git" ]; then
    echo -e "${YELLOW}Repositorio Git ya inicializado.${NC}"
    
    # Verificar si origin ya existe
    if git remote | grep -q "^origin$"; then
        echo -e "${YELLOW}El remoto 'origin' ya existe. Actualizando la URL...${NC}"
        git remote set-url origin $GITHUB_URL
    else
        echo -e "${YELLOW}Agregando remoto 'origin'...${NC}"
        git remote add origin $GITHUB_URL
    fi
else
    echo -e "${YELLOW}Inicializando repositorio Git...${NC}"
    git init
    git remote add origin $GITHUB_URL
fi

# Configurar el nombre de la rama principal como main
echo -e "${YELLOW}Configurando la rama principal como 'main'...${NC}"
git branch -M main

# Agregar todos los archivos
echo -e "${YELLOW}Agregando todos los archivos al staging...${NC}"
git add .

# Verificar si hay cambios para hacer commit
if git diff --staged --quiet; then
    echo -e "${RED}No hay cambios para hacer commit.${NC}"
    exit 1
else
    # Hacer commit de los cambios
    echo -e "${YELLOW}Creando commit inicial...${NC}"
    git commit -m "Versión inicial de Autologic"
fi

# Preguntar antes de subir
echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}¿Quieres subir los cambios a GitHub? (s/n)${NC}"
read -r respuesta

if [[ $respuesta =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Subiendo código a GitHub...${NC}"
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}¡Código subido exitosamente!${NC}"
        echo -e "${BLUE}================================================${NC}"
        echo -e "${GREEN}Tu repositorio está disponible en:${NC}"
        echo -e "${BLUE}$GITHUB_URL${NC}"
        echo -e "${BLUE}================================================${NC}"
    else
        echo -e "${RED}Error al subir el código.${NC}"
        echo -e "${YELLOW}Verifica tus credenciales de GitHub y que el repositorio exista.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Operación cancelada por el usuario.${NC}"
    exit 0
fi

# Mostrar estado final
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}Resumen de la operación:${NC}"
echo -e "${YELLOW}Repositorio:${NC} $GITHUB_URL"
echo -e "${YELLOW}Rama:${NC} main"
echo -e "${BLUE}================================================${NC}"

echo -e "${GREEN}Proceso completado.${NC}"