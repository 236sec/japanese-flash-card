# ---- Stage 1: Build static export ----
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build

# ---- Stage 2: Serve with nginx ----
FROM nginx:1.27-alpine

# Copy static export
COPY --from=builder /app/out /usr/share/nginx/html

# Nginx config for SPA routing
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    # SPA fallback\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    # Cache static assets\n\
    location /_next/static {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
    # Gzip\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
