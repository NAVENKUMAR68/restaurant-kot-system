# ---- Stage 1: Build ----
FROM node:20 AS build

WORKDIR /app

# Install ALL dependencies (including devDeps for TypeScript compiler)
COPY package*.json ./
RUN npm install

# Copy source and compile TypeScript → dist/
COPY . .
RUN npm run build

# ---- Stage 2: Production Runtime ----
FROM node:20-slim

WORKDIR /app

# Only install production dependencies (no TypeScript compiler in final image)
COPY package*.json ./
RUN npm install --omit=dev && apt-get update && apt-get install -y curl

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/index.js"]
