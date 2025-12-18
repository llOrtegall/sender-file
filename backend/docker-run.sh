#!/bin/bash

# Script para construir y ejecutar el contenedor Docker

# Cargar variables de entorno desde .env si existe
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo "✅ Variables cargadas desde .env"
fi

# Nombre de la imagen y contenedor (con valores por defecto)
IMAGE_NAME="${IMAGE_NAME:-r2-api}"
CONTAINER_NAME="${CONTAINER_NAME:-bakend-r2-api}"
VERSION="${VERSION:-1.0.0}"

# Detener y eliminar contenedor anterior si existe
echo "🧹 Limpiando recursos anteriores..."
docker stop ${CONTAINER_NAME} 2>/dev/null
docker rm ${CONTAINER_NAME} 2>/dev/null

# Eliminar imagen anterior si existe
docker rmi ${IMAGE_NAME}:${VERSION} 2>/dev/null

echo "🏗️  Construyendo imagen Docker..."
docker build -t ${IMAGE_NAME}:${VERSION} .

if [ $? -eq 0 ]; then
    echo "✅ Imagen construida exitosamente"
    
    echo "🚀 Ejecutando contenedor..."

    docker compose up -d
    
    if [ $? -eq 0 ]; then
        echo "✅ Contenedor ejecutándose"
        echo "📊 Logs: docker logs -f ${CONTAINER_NAME}"
        echo "🏥 Health: http://localhost:3000/health"
    else
        echo "❌ Error al ejecutar contenedor"
        exit 1
    fi
else
    echo "❌ Error al construir imagen"
    exit 1
fi
