FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package*.json ./

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]
