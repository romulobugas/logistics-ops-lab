FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/api/package.json ./apps/api/

RUN npm install

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npx", "ts-node", "apps/api/src/main.ts"]
