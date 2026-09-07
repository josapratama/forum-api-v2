FROM node:22-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy app source
COPY . .

# Copy nginx config
COPY nginx-docker.conf /etc/nginx/nginx.conf

# Copy supervisor config
COPY supervisord.conf /etc/supervisord.conf

# Create nginx log directory
RUN mkdir -p /var/log/nginx /var/lib/nginx/tmp /run/nginx

EXPOSE 443 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
