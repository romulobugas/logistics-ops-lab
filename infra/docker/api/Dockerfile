FROM node:20-bullseye

WORKDIR /usr/src/app

# Copy everything first
COPY . .

# Install dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN npm install --workspaces --include=dev
RUN npm install -g @nestjs/cli

# Generate Prisma client and build
RUN npm --workspace @logistics-ops-lab/api run db:generate
RUN npm --workspace @logistics-ops-lab/api run build

EXPOSE 3000

# Run migrations and start compiled API
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/main.js"]
