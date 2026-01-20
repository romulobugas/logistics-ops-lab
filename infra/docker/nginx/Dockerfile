FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY apps/web/package.json apps/web/package-lock.json ./apps/web/
RUN cd apps/web && npm ci

COPY apps/web ./apps/web
RUN cd apps/web && npm run build

FROM nginx:alpine

COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/apps/web/dist /usr/share/nginx/html/web

EXPOSE 80
