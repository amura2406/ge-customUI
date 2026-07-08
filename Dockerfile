# Use a secure, lightweight, and official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy configuration and source files
COPY package.json ./
COPY server.js ./
COPY public/ ./public/

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose the port (Cloud Run will inject its own PORT at runtime, but 8080 is default)
EXPOSE 8080

# Run the server using the npm start script
CMD ["npm", "start"]
