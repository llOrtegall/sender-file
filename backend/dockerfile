# ================================
# Multi-stage Dockerfile con Bun
# ================================

# Etapa 1: Build
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json bun.lock* ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN bun install --frozen-lockfile

# Copiar código fuente
COPY src ./src
COPY tsconfig.json ./

# Compilar TypeScript
RUN bun run build

# ================================
# Etapa 2: Runtime (Production)
# ================================
FROM oven/bun:1-alpine AS runner

# Instalar dumb-init para mejor manejo de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar solo archivos necesarios desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1))" || exit 1

# Usar dumb-init como entrypoint para mejor manejo de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["bun", "run", "start"]