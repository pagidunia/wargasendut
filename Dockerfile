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

# Create public folder if it doesn't exist
RUN mkdir -p public
COPY wargasendut/public ./public || true

EXPOSE 3000

CMD ["npm", "start"]
