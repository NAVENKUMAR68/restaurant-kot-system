# ---- Stage 1: Build ----
FROM node:20-alpine AS build

# Install build dependencies for potential native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies using npm ci for deterministic builds
COPY package*.json ./
RUN npm ci

# Copy source and compile TypeScript
COPY . .
RUN npm run build

# ---- Stage 2: Production Runtime ----
FROM node:20-alpine

# Set to production
ENV NODE_ENV=production

WORKDIR /app

# Install curl for health checks and production-only dependencies
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

EXPOSE 8000

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "dist/index.js"]
