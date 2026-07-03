FROM node:20-alpine

# Create app directory and set correct permissions
WORKDIR /usr/src/app

# Install dependencies with legacy-peer-deps as required by this project
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

# Bundle app source
COPY . .

# Run as non-root user for security
USER node

EXPOSE 5000

CMD ["node", "src/index.js"]
