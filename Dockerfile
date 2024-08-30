# Build React static files
FROM docker.io/library/node:20 as build

WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm ci --silent
COPY ./ ./
RUN npm run build

# Copy React static files and start nginx
FROM docker.io/library/nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html/tools/local-memory
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
