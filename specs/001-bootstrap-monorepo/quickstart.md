# Quickstart Guide: Bootstrap Monorepo Foundation

**Purpose**: Quick setup and verification guide for developers
**Created**: 2026-01-15
**Feature**: Bootstrap Monorepo Foundation

## Prerequisites

### Required Tools
- **Node.js**: 20 LTS or higher
- **pnpm**: 8.x or higher  
- **Docker**: Latest stable with Docker Compose v2
- **Git**: For version control

### System Requirements
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Storage**: 10GB free disk space
- **Network**: Internet connection for package downloads

## Setup Instructions

### 1. Repository Setup
```bash
# Clone the repository
git clone <repository-url>
cd logistics-ops-lab

# Switch to feature branch
git checkout 001-bootstrap-monorepo

# Install dependencies
pnpm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Review and update as needed
# Default values work for development
```

### 3. Start Development Environment
```bash
# Start all services
docker compose up -d --build

# View logs (optional)
docker compose logs -f
```

### 4. Verify Setup
```bash
# Check service health
curl http://localhost/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-01-15T16:50:00.000Z",
  "service": "api",
  "details": {
    "database": "connected",
    "cache": "connected",
    "messaging": "connected"
  }
}
```

## Development Workflow

### Code Quality
```bash
# Run linting
pnpm lint

# Check formatting
pnpm format:check

# Fix formatting
pnpm format

# Type checking
pnpm type-check
```

### Application Management
```bash
# Start API only
pnpm run start:api

# Start Worker only
pnpm run start:worker

# Development mode with hot reload
pnpm run dev:api
pnpm run dev:worker
```

## Service URLs

### Development Endpoints
- **API Health**: http://localhost/api/health
- **API Base**: http://localhost/api
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### Database Connections
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **RabbitMQ**: localhost:5672

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :80
netstat -tulpn | grep :5432

# Stop conflicting services
docker compose down
# Modify ports in docker-compose.yml if needed
```

#### Permission Issues
```bash
# Fix Docker permissions (Linux/Mac)
sudo usermod -aG docker $USER
# Log out and back in
```

#### Dependency Issues
```bash
# Clear pnpm cache
pnpm store prune

# Reinstall clean
rm -rf node_modules
pnpm install
```

### Health Check Failures
1. Check Docker containers are running: `docker compose ps`
2. Review service logs: `docker compose logs api`
3. Verify environment variables in `.env`
4. Check external service connectivity

### Performance Issues
1. Monitor resource usage: `docker stats`
2. Check disk space: `df -h`
3. Verify Docker memory limits

## Project Structure

```
logistics-ops-lab/
├── apps/
│   ├── api/                 # Main API application
│   └── worker/              # Background processing
├── infra/
│   ├── docker/
│   └── nginx/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
├── docker-compose.yml
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── README.md
└── docs/
```

## Next Steps

After successful setup:
1. Review the [feature specification](./spec.md)
2. Check [implementation plan](./plan.md)
3. Follow [task breakdown](./tasks.md) for development
4. Run tests to verify functionality

## Support

- **Documentation**: Check README.md for detailed guides
- **Issues**: Create GitHub issues for problems
- **Logs**: Always include logs when reporting issues
