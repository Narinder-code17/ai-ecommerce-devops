# ---- build stage ----
FROM node:20-alpine3.23 AS build
RUN apk upgrade --no-cache
WORKDIR /app
COPY application/package*.json ./
RUN npm ci --omit=dev
COPY application/ ./

# ---- runtime stage (small, non-root) ----
FROM node:20-alpine3.23
RUN apk upgrade --no-cache
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
ENV NODE_ENV=production PORT=3000
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app ./
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "src/server.js"]
