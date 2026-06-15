FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S clubhub && adduser -S clubhub -G clubhub

COPY --from=builder --chown=clubhub:clubhub /app/node_modules ./node_modules
COPY --from=builder --chown=clubhub:clubhub /app/dist ./dist
COPY --from=builder --chown=clubhub:clubhub /app/prisma ./prisma
COPY --from=builder --chown=clubhub:clubhub /app/package.json ./

USER clubhub
EXPOSE 3333

CMD ["node", "dist/server.js"]
