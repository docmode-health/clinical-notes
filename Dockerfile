# Stage 1: Build the app
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Add environment file
COPY .env.production .env

# Build the Next.js app
RUN npm run build

# Stage 2: Production runtime
FROM node:18-alpine

WORKDIR /app

# Copy built app and deps from builder
COPY --from=build /app /app

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

# Start the app
CMD ["npm", "start"]

