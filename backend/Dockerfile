# Node.js 20 Alpine official base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy application source files
COPY . .

# Expose application port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
