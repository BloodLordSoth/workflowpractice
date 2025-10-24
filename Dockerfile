FROM node:22-bullseye

WORKDIR /app

# Copy package files first
COPY backend/package*.json ./

# Install dependencies (inside Linux environment)
RUN npm install --only=production

# Copy source AFTER install
COPY backend/ ./

COPY frontend/ ./

EXPOSE 4455
CMD ["node", "server.js"]
