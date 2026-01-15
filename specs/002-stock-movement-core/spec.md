# Feature Specification: Simple WMS Stock Movement

**Feature Branch**: `002-stock-movement-core`  
**Created**: 2026-01-15  
**Status**: Draft  
**Input**: User description: "Implementar um mini backend WMS simples para demonstrar skills de backend com stock movements básicos."

---

## User Scenarios & Testing

### User Story 1 - Criar SKU (Priority: P1)

Como usuário do sistema, quero cadastrar um novo SKU para poder controlar seu estoque.

**Why this priority**: Entidade fundamental para qualquer operação de estoque.

**Independent Test**: POST /skus com dados válidos deve criar SKU e retornar 201.

**Acceptance Scenarios**:

1. **Given** dados válidos de SKU, **When** envio POST /skus, **Then** sistema cria SKU e retorna dados criados.
2. **Given** código de SKU duplicado, **When** envio POST /skus, **Then** retorna 422 com erro claro.

---

### User Story 2 - Movimentar Estoque (Priority: P1)

Como operador, quero registrar movimentos de estoque (entrada/saída) para manter o saldo atualizado.

**Why this priority**: Core operation do WMS - movimento de estoque.

**Independent Test**: POST /stock/in e POST /stock/out devem atualizar saldo corretamente.

**Acceptance Scenarios**:

1. **Given** SKU existe, **When** envio movimento de entrada, **Then** saldo aumenta e movimento é registrado.
2. **Given** SKU existe com saldo suficiente, **When** envio movimento de saída, **Then** saldo diminui e movimento é registrado.
3. **Given** saldo insuficiente, **When** envio movimento de saída, **Then** retorna 422 e não altera saldo.

---

### User Story 3 - Consultar Saldo (Priority: P1)

Como usuário, quero consultar o saldo atual de um SKU para saber quantas unidades tenho disponíveis.

**Why this priority**: Visibilidade do estoque é essencial para operação.

**Independent Test**: GET /stock/{sku} deve retornar saldo atual do SKU.

**Acceptance Scenarios**:

1. **Given** SKU existe, **When** consulto GET /stock/{sku}, **Then** retorna saldo atual.
2. **Given** SKU não existe, **When** consulto GET /stock/{sku}, **Then** retorna 404.

---

## Edge Cases

- O que acontece quando tentamos dar saída de mais unidades que o saldo atual?
- Como lidar com movimentos de quantidade zero ou negativa?
- O que acontece com SKU inexistente nos endpoints de movimento?

## Requirements

### Functional Requirements

- **FR-001**: System MUST expor endpoints REST para:
  - criar SKU POST /skus
  - movimento de entrada POST /stock/in
  - movimento de saída POST /stock/out
  - consultar saldo GET /stock/{sku}
  - healthcheck GET /health

- **FR-002**: System MUST persistir dados em PostgreSQL:
  - SKU (id, code, description, unit, createdAt)
  - StockBalance (skuId, quantity, updatedAt)
  - StockMovement (skuId, type, quantity, reason, createdAt)

- **FR-003**: System MUST implementar validações:
  - código SKU único
  - quantidade positiva nos movimentos
  - saldo suficiente para saídas

- **FR-004**: System MUST manter separação de camadas:
  - Controller (HTTP boundary)
  - Service (business logic)
  - Repository (data access)

### Constitution Deviations (Explicitly Justified)

**Deviation from Constitution Principles**:

- **Event-Driven Architecture**: Omitido para manter escopo simples de demonstração
- **Cache Strategy (Redis)**: Não necessário para volume de dados deste demo
- **Messaging (RabbitMQ)**: Não necessário para operações síncronas simples

**Justification**: Este é um projeto de demonstração técnica para entrevista, não um sistema produção. A simplificação permite implementação rápida (2-4 horas) enquanto demonstra core skills de backend (NestJS, PostgreSQL, layer separation). A complexidade adicional impediria o objetivo de ser "executável em minutos".

### Key Entities

- **SKU**: Item controlado (code, description, unit)
- **StockBalance**: Saldo atual por SKU (skuId, quantity)
- **StockMovement**: Histórico de movimentos (skuId, type, quantity, reason)

## Success Criteria

### Measurable Outcomes

- **SC-001**: POST /skus cria SKU em < 200ms local.
- **SC-002**: POST /stock/in/out atualiza saldo corretamente sem inconsistências.
- **SC-003**: GET /stock/{sku} retorna saldo atualizado após movimentos.
- **SC-004**: Sistema previne saídas que resultariam em saldo negativo.
- **SC-005**: docker compose up -d --build sobe stack completa e /health responde.
- **SC-006**: Código é limpo, legível e segue padrões NestJS básicos.

---

## Future Extensions (NOT IMPLEMENTED)

Para referência em entrevistas, estas seriam evoluções naturais:

- Múltiplos armazéns/depósitos
- Alocação de pedidos
- Análise ABC de curva de vendas
- Cache para consultas frequentes
- Event-driven architecture para auditoria
- Background jobs para relatórios

**Estes itens estão explicitamente fora do escopo atual** para manter o projeto simples e focado.
