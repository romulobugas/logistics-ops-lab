# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (strict mode) via Node.js (LTS)  
**Primary Dependencies**: NestJS framework, Prisma ORM  
**Storage**: PostgreSQL (transactional), Redis (cache)  
**Testing**: Jest (unit), Supertest (integration)  
**Target Platform**: Linux server with Docker Compose orchestration  
**Project Type**: Web application (backend services)  
**Performance Goals**: Domain-specific (e.g., 1000 req/s, <200ms p95)  
**Constraints**: Must comply with constitution principles (architecture-first, event-driven, observability)  
**Scale/Scope**: Domain-specific (e.g., 10k users, logistics operations volume)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Required Compliance Gates

- **Architecture-First**: Feature design must explicitly address business rules, scalability, and failure scenarios before implementation
- **Layer Separation**: Implementation must respect Controller → Service → Repository → Infrastructure boundaries
- **Event-Driven**: Asynchronous messaging must be used for decoupling and failure isolation where appropriate
- **Idempotency**: All event consumers must be idempotent with proper ACK handling
- **Cache Strategy**: Any caching must be read-through with mandatory invalidation on writes
- **Observability**: All operations must include structured logging and request/event tracing
- **Technology Stack**: Must use TypeScript/NestJS/PostgreSQL/Redis/RabbitMQ per constitution constraints

### Violation Justification Required

If any gate cannot be satisfied, must document in Complexity Tracking section with:
- Specific principle being violated
- Technical justification why violation is necessary
- Alternative approaches considered and why they were rejected

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# NestJS Backend Application (per constitution)
src/
├── modules/
│   ├── [feature-name]/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── dto/
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   └── interceptors/
│   └── config/
├── infra/
│   ├── database/
│   ├── messaging/
│   └── cache/
└── main.ts

tests/
├── unit/
├── integration/
└── contract/

docker-compose.yml
.env.example
package.json
```

**Structure Decision**: NestJS modular architecture following constitution principles with clear layer separation (controllers/services/repositories) and infrastructure isolation

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
