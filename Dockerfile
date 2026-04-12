# Build stage
# Use a slim Node.js Alpine image for a small footprint
FROM node:20-alpine AS build
WORKDIR /app

# Copy package management files to leverage layer caching for faster subsequent builds
COPY package.json package-lock.json ./

# Install dependencies strictly from the lockfile for consistent builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set environment variables for the build
# These can be overridden via --build-arg VITE_API_BASE_URL=... if needed
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the production-ready static assets (output to 'dist/')
RUN npm run build

# Production stage
# Use Nginx Alpine for a secure, fast, and minimal final image
FROM nginx:stable-alpine

# Copy the built assets from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration to handle SPA routing and API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the frontend
EXPOSE 80

# The default Nginx entrypoint is used, starting Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
