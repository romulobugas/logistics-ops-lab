<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.0.1 (PATCH: Template alignment and consistency improvements)
- Modified principles: None (principles unchanged)
- Added sections: None
- Removed sections: None
- Templates updated:
  ✅ .specify/templates/plan-template.md (aligned technology stack, added constitution gates, updated NestJS structure)
  ✅ .specify/templates/tasks-template.md (TypeScript paths, observability requirements, test file extensions)
- Follow-up TODOs: None
-->

# logistics-ops-lab Constitution

## Core Principles

### I. Architecture-First (NON-NEGOTIABLE)
All features must be designed from an architectural perspective before implementation.
Business rules, scalability concerns, and failure scenarios must be considered explicitly.
Frameworks and libraries are implementation details and must not drive architectural decisions.

### II. Thin Controllers, Explicit Use-Cases
Controllers are HTTP boundaries only.
They must:
- Validate input (DTOs)
- Delegate execution to services (use-cases)

Controllers must never:
- Contain business rules
- Access persistence or external systems directly

### III. Clear Layer Separation
The system must respect strict layering:

- **Controller**: HTTP / transport boundary
- **Service (Use-Case)**: Business orchestration and rules
- **Repository**: Persistence and data access
- **Messaging**: Event publishing and consumption
- **Infrastructure**: External integrations (DB, Redis, RabbitMQ)

Cross-layer access is forbidden.

### IV. Event-Driven by Design
Asynchronous messaging is a first-class architectural concern.
Events must be used to:
- Decouple producers from consumers
- Isolate failures between services
- Absorb load spikes without impacting core flows

Synchronous calls must not depend on asynchronous consumers to succeed.

### V. Idempotency and Failure Tolerance
All event consumers must be idempotent.
The system must assume:
- Events can be duplicated
- Consumers can restart
- Messages can be retried

Acknowledgement (ACK) must only happen after the side effect is committed.

### VI. Explicit Cache Strategy
Caching must be explicit and intentional.
Rules:
- Cache read-through only
- Cache invalidation on writes is mandatory
- Cache must never be the source of truth

### VII. Observability and Traceability
The system must be observable by default.
All requests and background jobs must produce structured logs.
Every operation must be traceable via a `requestId` or `eventId`.

---

## Technology and Architecture Constraints

- Language: **TypeScript (strict mode enabled)**
- Runtime: **Node.js (LTS)**
- Framework: **NestJS**
- Database (transactional): **PostgreSQL via Prisma**
- Cache: **Redis**
- Messaging: **RabbitMQ**
- Local orchestration: **Docker Compose**
- Edge / entry point: **Nginx reverse proxy**

No alternative technologies may be introduced without explicit justification.

---

## Development Workflow and Quality Standards

- Each feature must be developed in an isolated feature branch.
- Specs must exist before implementation.
- Implementation must conform to the active spec and this Constitution.
- Features must be small, incremental, and independently runnable.
- Health endpoints are mandatory for all services.
- Environment configuration must be externalized (`.env.example` required).

---

## Governance

This Constitution supersedes all other documents, specs, and plans.

- All generated plans and tasks must comply with this Constitution.
- Any deviation must be explicitly documented and justified in the feature spec.
- Amendments to this Constitution require:
  - Clear motivation
  - Migration strategy
  - Version bump

**Version**: 1.0.1  
**Ratified**: 2026-01-15  
**Last Amended**: 2026-01-15
