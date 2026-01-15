FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/worker/package.json ./apps/worker/

RUN npm install

COPY . .

RUN npm install

EXPOSE 3001

CMD ["npx", "ts-node", "apps/worker/src/main.ts"]
