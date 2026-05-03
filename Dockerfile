# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

FROM base AS development
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM base AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY src ./src
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3001
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
