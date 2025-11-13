# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (inklusive dev för att kunna bygga)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# Kopiera bara dist och package.json från builder
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Installera endast production dependencies
RUN npm ci --omit=dev

# Expose port
EXPOSE 10000

# Starta appen
CMD ["node", "dist/server.js"]
