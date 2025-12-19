# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar la aplicación
RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine3.19-slim

# Copiar los archivos compilados desde el stage de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80
EXPOSE 80

# Nginx se ejecuta en primer plano por defecto en la imagen oficial
CMD ["nginx", "-g", "daemon off;"]
