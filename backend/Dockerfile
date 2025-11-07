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

# Start the app
CMD [ "npm", "start" ]
