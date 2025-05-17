# 1. Dependencies stage
FROM node:23-alpine AS deps
WORKDIR /app
COPY mindmap/package.json ./package.json
COPY mindmap/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

# 2. Build stage
FROM node:23-alpine AS builder
WORKDIR /app
COPY mindmap/ ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# 3. Production runtime stage
FROM node:23-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
