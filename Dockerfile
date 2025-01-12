# Stage 1: Build React App
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY ./frontend/package*.json ./
RUN npm install --force
COPY ./frontend .
RUN npm run build

# Stage 2: Build Node.js REST API and serve frontend
FROM node:18
WORKDIR /app/backend
COPY ./backend/package*.json ./
RUN npm install
COPY ./backend .
COPY --from=frontend-builder /app/frontend/build ./public

# Expose the port for the API
EXPOSE 5000

# Start the server
CMD ["node", "./bin/www"]
