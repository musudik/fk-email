To use this service from other containers/services:

1. Connect other services to the email network:

# In other service's docker-compose.yml
services:
  your-service:
    networks:
      - email-network

networks:
  email-network:
    external: true
    name: email-network


2. Access the email service using:
http://email-service:3003

3. To deploy:
# Start the email service
docker-compose up --build -d

# Check logs
docker-compose logs -f

Make sure to update the CORS origins list with any additional services that need to access the email service.