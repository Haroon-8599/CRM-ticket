# -------------------------------------------------------------
# Stage 1: Build React Frontend
# -------------------------------------------------------------
FROM node:22-alpine AS client-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Server
# -------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=./data/crm.sqlite

# Copy backend package definition and install production dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend assets into client/dist relative to server
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start application
CMD ["node", "index.js"]
