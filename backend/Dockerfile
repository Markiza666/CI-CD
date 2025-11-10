FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the project
COPY . .

# Build TypeScript to dist/
RUN npm run build

# Remove devDependencies for production
RUN npm prune --production

# Expose the port your Express app runs on
EXPOSE 5000

# Healthcheck for Render (optional but recommended)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the app
CMD ["node", "dist/server.js"]
