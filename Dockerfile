FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# build production image

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production

RUN pnpm install --frozen-lockfile

COPY --from=builder /app/dist ./dist

RUN chown -R node:node /app && chmod -R 755 /app

RUN pnpm add pm2 -g

COPY src/ecosystem.config.js .

USER node

EXPOSE 5513

CMD ["pm2", "start", "ecosystem.config.js"]
