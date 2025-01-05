FROM node:20-alpine
WORKDIR /app

# Copy the application dependencies
COPY package*.json ./

# Install dependencies including curl for healthcheck
RUN apk add --no-cache curl && \
    npm install

# Copy in the source code
COPY . .

# The email service runs on 3003 as per .env files
EXPOSE 3003

# Run the application
CMD ["npm", "run", "start:prod"]