FROM node:20-alpine

WORKDIR /usr/src/app

# Copy everything first
COPY . .

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Generate Prisma client and build
RUN pnpm exec prisma generate --schema=apps/api/prisma/schema.prisma
RUN pnpm --filter @logistics-ops-lab/api build

EXPOSE 3000

# Run compiled API
CMD ["node", "apps/api/dist/main.js"]
