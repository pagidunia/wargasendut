# Build stage
FROM node:20-alpine AS builder

WORKDIR /app/wargasendut

COPY wargasendut/package*.json ./
RUN npm ci

COPY wargasendut . .
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app/wargasendut

RUN npm install -g pm2

COPY wargasendut/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/wargasendut/.next ./.next

# Copy public folder if it exists
RUN mkdir -p public && cp -r wargasendut/public . 2>/dev/null || true

EXPOSE 3000

CMD ["npm", "start"]
