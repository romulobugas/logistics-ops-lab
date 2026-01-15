# Logistics Ops Lab

A comprehensive logistics operations platform built with Node.js, TypeScript, and NestJS.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.x LTS or higher
- **pnpm**: 8.x or higher  
- **Docker**: Latest stable with Docker Compose v2
- **Git**: For version control

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logistics-ops-lab
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development environment**
   ```bash
   docker compose up -d --build
   ```

4. **Verify the setup**
   ```bash
   # Check API health
   curl http://localhost/api/health
   
   # Check Worker health  
   curl http://localhost:3001/health
   
   # View logs
   docker compose logs -f
   ```

## 📁 Project Structure

```
logistics-ops-lab/
├── apps/
│   ├── api/                 # Main HTTP API service
│   │   ├── src/
│   │   │   └── modules/
│   │   │       └── health/
│   │   │           ├── controllers/
│   │   │           ├── services/
│   │   │           └── dto/
│   │   └── package.json
│   └── worker/              # Background processing service
│       ├── src/
│       │   └── modules/
│       │       └── health/
│       │           ├── controllers/
│       │           ├── services/
│       │           └── dto/
│       └── package.json
├── infra/
│   ├── docker/
│   │   ├── api/Dockerfile
│   │   └── worker/Dockerfile
│   └── nginx/
│       └── nginx.conf
├── docker-compose.yml
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## 🔧 Development

### Available Scripts

From the repository root:

```bash
# Install dependencies
pnpm install

# Start all services
pnpm docker:up

# Stop all services
pnpm docker:down

# View logs
pnpm docker:logs

# Build all applications
pnpm build

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check code formatting
pnpm format:check

# Fix code formatting
pnpm format

# Type checking
pnpm type-check
```

From individual applications:

```bash
# API development
cd apps/api
pnpm start:dev

# Worker development
cd apps/worker  
pnpm start:dev
```

## 🌐 API Endpoints

### Health Check

- **GET** `/api/health`
  - Returns service health status
  - Response: 200 (healthy) or 503 (unhealthy)
  - Example response:
    ```json
    {
      "status": "healthy",
      "timestamp": "2026-01-15T16:50:00.000Z",
      "service": "api",
      "details": {
        "uptime": 1234.56,
        "version": "1.0.0",
        "environment": "development"
      }
    }
    ```

## 🐳 Docker Services

The application includes these Docker services:

- **PostgreSQL**: Port 5432
- **Redis**: Port 6379  
- **RabbitMQ**: Ports 5672 (AMQP) and 15672 (Management UI)
- **API**: Port 3000 (internal), exposed via Nginx on port 80
- **Worker**: Port 3001 (internal)
- **Nginx**: Port 80 (reverse proxy)

## 🔍 Environment Configuration

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`
- `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, `RABBITMQ_VHOST`
- `NODE_ENV`, `API_PORT`, `WORKER_PORT`
- `LOG_LEVEL`, `LOG_FORMAT`

## 📋 Code Quality

This project uses:

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Pino**: Structured JSON logging

Run code quality checks:
```bash
pnpm lint          # Check linting
pnpm format:check   # Check formatting
pnpm type-check     # Verify TypeScript types
```

## 🐛 Troubleshooting

### Common Issues

#### Docker Issues

**Problem**: Docker not installed or not running
```bash
# Check Docker status
docker --version

# Start Docker daemon (Windows)
Start-Service docker

# Start Docker daemon (Linux/macOS)
sudo systemctl start docker
sudo systemctl enable docker
```

**Problem**: Port conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :80
netstat -tulpn | grep :5432

# Kill processes using ports
sudo lsof -ti:80
sudo lsof -ti:5432

# Or change ports in docker-compose.yml
```

**Problem**: Insufficient Docker resources
```bash
# Check Docker resource usage
docker stats

# Increase Docker memory (if needed)
# Add to docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 1G
```

**Problem**: pnpm not available
```bash
# Install pnpm globally
npm install -g pnpm

# Use npm instead (temporary)
npm install
npm run build
```

### Application Issues

**Problem**: Services fail to start
```bash
# Check service logs
docker compose logs api
docker compose logs worker
docker compose logs postgres

# Check service health
docker compose ps

# Restart specific service
docker compose restart api
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [pnpm Workspace Guide](https://pnpm.io/workspaces/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Follow the code quality standards
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
