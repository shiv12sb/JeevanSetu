# ==============================================================================
# JEEVANSETU BACKEND — PRODUCTION DOCKERFILE
# ==============================================================================

# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# 2. Dependencies
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 3. Production Release
FROM base AS release
ENV NODE_ENV=production
ENV PORT=5000

# Create non-root unprivileged service user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S jeevansetu -u 1001 -G nodejs

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src/
COPY server.js ./

# Set file permissions
RUN chown -R jeevansetu:nodejs /app
USER jeevansetu

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health/live || exit 1

EXPOSE 5000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
