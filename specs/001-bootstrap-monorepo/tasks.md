---

description: "Task list template for feature implementation"
---

# Tasks: Bootstrap Monorepo Foundation

**Input**: Design documents from `/specs/001-bootstrap-monorepo/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included - feature specification does not request test implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Compose**: `docker-compose.yml` at repository root
- **Monorepo**: `apps/`, `infra/` at repository root
- **API Application**: `apps/api/src/`
- **Worker Application**: `apps/worker/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create monorepo structure per implementation plan
- [ ] T002 Initialize pnpm workspace with root package.json and pnpm-workspace.yaml
- [ ] T003 [P] Configure ESLint and Prettier at monorepo level
- [ ] T004 [P] Create TypeScript configuration with strict mode enabled

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user Story work can begin until this phase is complete

- [ ] T005 Create docker-compose.yml at repository root with PostgreSQL, Redis, RabbitMQ, Nginx services
- [ ] T006 [P] Create Nginx reverse proxy configuration routing /api/* to API service
- [ ] T007 [P] Create environment configuration templates (.env.example) with all required variables
- [ ] T008 [P] Setup structured logging infrastructure (Pino) with correlation ID support
- [ ] T009 [P] Create environment configuration setup using @nestjs/config in apps/api and apps/worker (no shared packages in bootstrap)
- [ ] T010A [P] Add comprehensive prerequisites & troubleshooting section to README/quickstart covering ALL spec edge cases (Docker not installed/running, port conflicts 80/5432/6379/5672/15672, pnpm missing, insufficient Docker resources) + include validation commands for Windows (PowerShell) and Linux (bash)

- [ ] T010B [P] Add minimal check script (scripts/check-prereqs.ps1 and scripts/check-prereqs.sh) to detect Docker availability and common port conflicts


**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Development Environment Setup (Priority: P1) 🎯 MVP

**Goal**: Enable developers to quickly set up complete development environment

**Independent Test**: Can be fully tested by running `docker compose up -d --build` and verifying all services start successfully, then accessing `http://localhost/api/health` to confirm API is accessible through Nginx.

### Implementation for User Story 1

- [ ] T010 [P] [US1] Create HealthCheck DTO in apps/api/src/modules/health/dto/health-check.dto.ts
- [ ] T011 [P] [US1] Implement HealthService in apps/api/src/modules/health/services/health.service.ts (depends on T010)
- [ ] T012 [US1] Implement HealthController in apps/api/src/modules/health/controllers/health.controller.ts (depends on T011)
- [ ] T013 [US1] Create HealthModule in apps/api/src/modules/health/health.module.ts (depends on T011, T012)
- [ ] T014 [US1] Add HealthModule to main application module in apps/api/src/app.module.ts
- [ ] T015 [US1] Add structured logging with correlation IDs to API application in apps/api/src/main.ts
- [ ] T016 [US1] Create API Dockerfile in infra/docker/api/Dockerfile
- [ ] T017 [US1] Update Docker Compose to include API service build and configuration

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Code Quality Standards (Priority: P2)

**Goal**: Ensure consistent code formatting and linting across the monorepo

**Independent Test**: Can be fully tested by running linting and formatting commands on the codebase and verifying they pass without errors.

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create ESLint configuration at root .eslintrc.js covering TypeScript and NestJS rules
- [ ] T019 [P] [US2] Create Prettier configuration at root .prettierrc with consistent formatting rules
- [ ] T020 [P] [US2] Add lint and format scripts to root package.json
- [ ] T021 [US2] Update TypeScript configuration to enforce strict mode across all packages

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Project Documentation (Priority: P2)

**Goal**: Provide clear documentation for setup, configuration, and contribution

**Independent Test**: Can be fully tested by following README instructions from scratch and verifying each step works as documented.

### Implementation for User Story 3

- [ ] T022 [US3] Create comprehensive README.md with setup instructions and troubleshooting guide
- [ ] T023 [US3] Create API package.json with development scripts (start, build, test)
- [ ] T024 [US3] Create Worker package.json with development scripts
- [ ] T025 [US3] Create pnpm-workspace.yaml defining apps/api and apps/worker

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Worker Application Setup (Cross-Cutting)

**Purpose**: Implement Worker application with health checks and logging

- [ ] T026 [P] Create Worker health check module in apps/worker/src/modules/health/
- [ ] T027 [P] Create Worker main application with structured logging in apps/worker/src/main.ts
- [ ] T028 [P] Create Worker Dockerfile in infra/docker/worker/Dockerfile
- [ ] T029 [P] Update Docker Compose to include Worker service build and configuration

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T030 [P] Update README.md and quickstart.md if needed
- [ ] T031 [P] Code cleanup and refactoring across all applications
- [ ] T032 [Deferred] Performance optimization (out of scope for bootstrap; revisit on first domain feature)
- [ ] T033 [P] End-to-end testing of complete Docker Compose stack

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Worker Setup (Phase 6)**: Depends on Foundational phase, parallel to user stories
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- DTOs before services
- Services before controllers
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All DTOs for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3 + Worker setup
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
