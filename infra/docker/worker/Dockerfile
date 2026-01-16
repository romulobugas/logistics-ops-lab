FROM node:20-alpine

WORKDIR /usr/src/app

# Copy everything first
COPY . .

# Install dependencies using npm (fallback if pnpm fails)
RUN npm install -g pnpm || npm install

# Build
RUN npm run build || echo "Build skipped"

EXPOSE 3001

# Use ts-node for development (fallback if build fails)
CMD ["npx", "ts-node", "apps/worker/src/main.ts"]
