# Implementation Plan: Simple WMS Stock Movement Demo

**Branch**: `002-stock-movement-core`  
**Date**: 2026-01-15  
**Spec**: [spec.md](./spec.md)

---

## Summary

Implement a **minimal and practical WMS-like backend system** focused on basic stock representation and simple stock movement operations.

This project is intentionally **small, synchronous, and straightforward**, designed to demonstrate backend engineering skills and real-world WMS domain knowledge in a clean and fast-to-build solution.

It is **not a production-ready WMS**, but a technical demonstration aligned with job requirements and daily backend practices.

---

## Scope Statement

### In Scope

- Simple stock entity (SKU + quantity)
- Basic stock movements:
  - Inbound (increase stock)
  - Outbound (decrease stock)
- Synchronous REST API
- Minimal persistence
- Clear separation of layers:
  - Controller → Service → Repository
- Dockerized local development environment
- Clean, readable, and idiomatic code

### Explicitly Out of Scope

- No ABC analysis
- No allocation algorithms
- No forecasting
- No background jobs
- No event-driven architecture
- No caching strategies
- No performance tuning
- No AI or OpenAI integrations
- No enterprise WMS complexity

These items may be mentioned as **future extensions**, but are **not implemented**.

---

## Technical Context

**Language**: TypeScript (strict mode)  
**Framework**: NestJS  
**Persistence**: Simple PostgreSQL usage (Prisma or raw access, minimal)  
**Architecture**: Monolithic API (single service)  
**API Style**: REST, synchronous  
**Testing**: Optional / minimal  
**Runtime**: Docker Compose (API + PostgreSQL)  

**Design Priority**:  
> Clarity and simplicity over completeness.

---

## Constitution Alignment

This feature includes **explicit deviations** from Constitution principles for demo scope:

- **Architecture-First**: ✅ Simple business rules defined upfront
- **Layer Separation**: ✅ Controller / Service / Repository
- **Event-Driven**: ⚠️ **DEVIATION**: Omitted for simple demo scope
- **Cache Strategy**: ⚠️ **DEVIATION**: Redis not needed for demo volume
- **Observability**: ✅ Basic logging and health endpoint
- **Technology Stack**: ⚠️ **DEVIATION**: PostgreSQL only (Redis/RabbitMQ omitted)

**Justification**: Technical demonstration for interview, not production system. Simplification enables rapid implementation while demonstrating core backend skills.

---

## Project Structure

```text
apps/api/
├── src/
│   ├── modules/
│   │   └── stock/
│   │       ├── controllers/
│   │       │   └── stock.controller.ts
│   │       ├── services/
│   │       │   └── stock.service.ts
│   │       ├── repositories/
│   │       │   └── stock.repository.ts
│   │       └── dto/
│   │           ├── create-sku.dto.ts
│   │           └── stock-movement.dto.ts
│   ├── config/
│   └── main.ts
│
docker-compose.yml
.env.example
package.json
README.md
```

---

## Implementation Strategy

1. Implement stock entity
2. Implement stock movement logic
3. Expose REST endpoints
4. Persist state
5. Validate via simple manual tests

**No research phase. No speculative design. No premature optimization.**

---

## Guiding Principle

This project exists to be read, understood, and executed quickly.

If someone can clone the repo, run Docker, hit a few endpoints, and understand the code in minutes — the goal is achieved.

---

## ✅ O QUE ISSO RESOLVE

- ❌ Remove **ABC Analysis**
- ❌ Remove **research / unknowns**
- ❌ Remove **Constitution violations**
- ❌ Remove **overengineering**
- ✅ Alinha com vaga **C# backend mindset**
- ✅ Parece um **mini WMS real**
- ✅ Executável rápido
- ✅ Fácil de explicar em entrevista

---

## Próximo passo correto (recomendado)

1. **Não rode mais `/speckit.plan` para esse projeto**
2. Gere **tasks simples** (ou escreva manualmente)
3. Faça:
   ```bash
   docker compose up
   ```
4. Implemente:
   - POST /skus
   - POST /stock/in
   - POST /stock/out
   - GET /stock/{sku}
