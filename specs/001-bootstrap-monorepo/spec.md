# Feature Specification: Bootstrap Monorepo Foundation

**Feature Branch**: `001-bootstrap-monorepo`  
**Created**: 2026-01-15  
**Status**: Draft  
**Input**: User description: "Criar a feature de bootstrap do projeto logistics-ops-lab. Objetivo: Inicializar a fundação técnica do repositório como um monorepo Node.js/TypeScript, seguindo rigorosamente a Constitution, para suportar futuras features de domínio logístico e arquiteturas orientadas a eventos."

## Clarifications

### Session 2026-01-15

- Q: What performance targets should be defined for the bootstrap phase? → A: Use "reasonable performance" as guideline, defer specific targets to first production feature
- Q: What development workflow should be established? → A: Define Git workflow (GitFlow/GitHub Flow) and branch naming conventions
- Q: What environment configuration scope should be included? → A: Focus on development environment only, defer production secrets to first production feature

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Development Environment Setup (Priority: P1)

As a developer joining the logistics-ops-lab project, I want to quickly set up the complete development environment so that I can start contributing to features without manual configuration headaches.

**Why this priority**: Without a working development environment, no other features can be developed or tested. This is the foundational enabler for all subsequent work.

**Independent Test**: Can be fully tested by running `docker compose up -d --build` and verifying all services start successfully, then accessing `http://localhost/api/health` to confirm the API is accessible through Nginx.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** I run `pnpm install`, **Then** all dependencies for both apps install without errors
2. **Given** installed dependencies, **When** I run `docker compose up -d --build`, **Then** all containers (PostgreSQL, Redis, RabbitMQ, Nginx, API, Worker) start successfully
3. **Given** running containers, **When** I access `http://localhost/api/health`, **Then** I receive HTTP 200 response
4. **Given** running environment, **When** I check logs, **Then** both API and Worker show structured JSON logs with correlation IDs

---

### User Story 2 - Code Quality Standards (Priority: P2)

As a developer working on the codebase, I want consistent code formatting and linting so that all team members follow the same coding standards and the codebase remains maintainable.

**Why this priority**: Code quality standards prevent technical debt and ensure consistency across the monorepo as the team grows.

**Independent Test**: Can be fully tested by running linting and formatting commands on the codebase and verifying they pass without errors.

**Acceptance Scenarios**:

1. **Given** the monorepo structure, **When** I run `pnpm lint`, **Then** all TypeScript files pass ESLint validation
2. **Given** the monorepo structure, **When** I run `pnpm format:check`, **Then** all files are properly formatted according to Prettier rules
3. **Given** new code changes, **When** I run `pnpm type-check`, **Then** TypeScript compilation succeeds with strict mode enabled

---

### User Story 3 - Project Documentation (Priority: P2)

As a new developer, I want clear documentation so that I can understand how to set up, run, and contribute to the project without requiring extensive hand-holding.

**Why this priority**: Good documentation reduces onboarding time and enables self-service development, which is critical for team productivity.

**Independent Test**: Can be fully tested by following the README instructions from scratch and verifying each step works as documented.

**Acceptance Scenarios**:

1. **Given** the repository root, **When** I read README.md, **Then** it contains complete setup instructions
2. **Given** the setup instructions, **When** I follow them step by step, **Then** I can successfully run the entire stack
3. **Given** the environment configuration, **When** I check .env.example, **Then** all required variables are documented with explanations

---

## Edge Cases

- What happens when Docker is not installed or running?
- How does system handle port conflicts (80, 5432, 6379, 5672, 15672)?
- What happens when pnpm is not available globally?
- How does system handle insufficient system resources for Docker containers?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a monorepo structure using pnpm workspaces
- **FR-002**: System MUST include two independent NestJS applications (apps/api and apps/worker)
- **FR-003**: System MUST expose GET /health endpoint on both applications returning HTTP 200
- **FR-004**: System MUST provide docker-compose.yml with PostgreSQL, Redis, RabbitMQ (with management plugin), and Nginx services
- **FR-005**: System MUST configure Nginx as reverse proxy exposing only port 80 and routing /api/* to apps/api
- **FR-006**: System MUST use TypeScript with strict mode enabled across all packages
- **FR-007**: System MUST implement structured JSON logging with request/correlation IDs
- **FR-008**: System MUST use @nestjs/config for environment-specific configuration
- **FR-009**: System MUST ensure controllers remain thin without business logic
- **FR-010**: System MUST restrict external dependencies (DB, Redis, RabbitMQ) to dedicated services
- **FR-011**: System MUST provide ESLint and Prettier configuration at monorepo level
- **FR-012**: System MUST create .env.example documenting all necessary environment variables
- **FR-013**: System MUST provide comprehensive README.md with setup and verification instructions

### Key Entities

- **Monorepo Workspace**: Container for multiple related packages with shared dependencies and tooling
- **API Application**: HTTP-facing NestJS service for external communication
- **Worker Application**: Background processing NestJS service for asynchronous operations
- **Infrastructure Services**: External dependencies (PostgreSQL, Redis, RabbitMQ) managed via Docker Compose
- **Reverse Proxy**: Nginx configuration for routing external requests to internal services

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Development environment can be provisioned following README instructions on a machine with Docker and pnpm installed, without requiring manual configuration beyond environment variables.
- **SC-002**: All containers start successfully after resolving common prerequisites (Docker running, ports available, env configured) without persistent errors.
- **SC-003**: GET http://localhost/api/health returns HTTP 200 within 2 seconds
- **SC-004**: Both applications compile and start without TypeScript errors or warnings
- **SC-005**: Codebase passes all linting and formatting rules without manual fixes needed
- **SC-006**: New developers can complete full setup following README without assistance
- **SC-007**: Project structure fully complies with all 7 principles of the Constitution
- **SC-008**: System produces structured logs suitable for monitoring and debugging
