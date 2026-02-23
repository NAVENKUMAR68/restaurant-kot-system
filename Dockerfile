# Build Stage
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run Stage
FROM node:22-slim
WORKDIR /app
# Only copy the built files and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 8000
CMD ["npm", "run", "start"]
