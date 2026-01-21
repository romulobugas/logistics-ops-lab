# Logistics Ops Lab

Plataforma de operações logísticas (mini WMS) para demonstrar backend, worker e painel web. Stack: Node.js, TypeScript, NestJS, React e RabbitMQ.

## ✅ Escopo atual

- Cadastros: produtos, SKUs, unidades, grupos de produto e armazenagem
- Estoque: endereços, lotes, reservas e saldo disponível
- Movimentações: entrada, saída, transferência e ajuste
- Autenticação com perfis e permissões por rota
- Worker para processar atividades via RabbitMQ
- Painel web para login, manutenção de produtos, movimentações e rastreabilidade

## 🚀 Início rápido (Docker)

### Pré-requisitos

- **Node.js**: 20.x ou superior
- **pnpm**: 8.x ou superior
- **Docker**: versão estável com Compose v2

### Stack completa (API + Worker + Web)

```bash
pnpm install
pnpm docker:up
```

### Stack simples (Postgres + API)

```bash
docker compose -f docker-compose.simple.yml up -d --build
```

### Verificação rápida

```bash
# API direta (stack simples)
curl http://localhost:3000/health

# Via Nginx (stack completa)
curl http://localhost/api/health
```

## 📁 Estrutura do projeto

```
logistics-ops-lab/
├── apps/
│   ├── api/                 # API principal (NestJS, Prisma)
│   ├── worker/              # Worker para tarefas em background (NestJS, RabbitMQ)
│   └── web/                 # Painel de controle (React, Vite)
├── docs/                    # Documentação adicional do projeto
├── infra/
│   ├── docker/              # Dockerfiles para cada serviço
│   └── nginx/               # Configuração do Nginx como proxy reverso
├── specs/                   # Especificações e planejamento
├── docker-compose.yml       # Orquestração da stack completa
├── docker-compose.simple.yml  # Orquestração da stack mínima (API + DB)
├── .env.example             # Exemplo de variáveis de ambiente
├── pnpm-workspace.yaml      # Definição do monorepo pnpm
└── package.json             # Scripts e dependências do root
```

## 🧭 Arquitetura

- **API (NestJS)**: expõe endpoints REST, autenticação, estoque e cadastros
- **Worker (NestJS)**: processa atividades de estoque via RabbitMQ (`stock.activities`)
- **Web (React)**: painel operacional consumindo `/api`

Fluxo principal: API → RabbitMQ → Worker → atividades/rastreabilidade.

## 🔗 Acessos úteis (stack completa)

- **Web**: http://localhost
- **API**: http://localhost/api
- **Health**: http://localhost/api/health
- **Swagger (API direta)**: http://localhost:3000/api
- **RabbitMQ UI**: http://localhost:15672 (logistics_user / logistics_password)
- **pgAdmin**: http://localhost:5050 (admin@logistics.com / admin123)

> Observação: a API também fica disponível diretamente em http://localhost:3000.

## 🧪 Desenvolvimento local

Após instalar as dependências com `pnpm install`, você pode rodar todos os serviços simultaneamente:

```bash
# Inicia api, worker e web em modo de desenvolvimento
pnpm dev
```

Se preferir, pode rodar cada serviço em um terminal separado:

```bash
# Terminal 1: API
pnpm --filter api start:dev

# Terminal 2: Worker
pnpm --filter worker start:dev

# Terminal 3: Web
pnpm --filter web dev
```

> **Observação**: A configuração do Vite já inclui um proxy para que as chamadas do frontend para `/api` sejam redirecionadas para o servidor da API na porta 3000.

## 🗄️ Banco e seed

```bash
cd apps/api
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Usuários de demonstração são criados no seed (consulte `apps/api/prisma/seed.ts` ou a tela de login do web).

## 🌐 Endpoints principais

Base da API:
- Stack simples: `http://localhost:3000`
- Stack completa: `http://localhost/api`

Principais rotas:
- `GET /health`
- `POST /auth/login` · `GET /auth/me` · `GET /auth/permissions`
- `GET/POST /products` · `GET/POST /skus`
- `GET/POST /units` · `GET/POST /product-groups` · `GET/POST /storage-groups`
- `GET/POST /stock/locations` · `GET /stock/lots`
- `POST /stock/in` · `POST /stock/out` · `POST /stock/transfer`
- `GET /stock/balances`
- `GET /stock/activities` · `PATCH /stock/activities/:id/assign|complete|cancel`
- `GET /stock/activities/:id/traces` · `GET /stock/operators`

## 🐳 Serviços Docker e portas

- **PostgreSQL**: 5432
- **Redis**: 6379
- **RabbitMQ**: 5672 (AMQP) · 15672 (UI)
- **API**: 3000
- **Worker**: 3001 (exposto como 3002)
- **Nginx**: 80
- **pgAdmin**: 5050

## ⚙️ Variáveis de ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Principais variáveis:
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`
- `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, `RABBITMQ_VHOST`
- `NODE_ENV`, `API_PORT`, `WORKER_PORT`
- `LOG_LEVEL`, `LOG_FORMAT`

## ✅ Qualidade de código

```bash
pnpm lint
pnpm format:check
pnpm type-check
```

## 🐛 Troubleshooting

- Verifique se as portas estão livres (80, 3000, 5432, 5672, 15672).
- Consulte logs: `docker compose logs -f api` · `docker compose logs -f worker`.
- Em Windows, confirme se o Docker Desktop está em execução.

## 📚 Recursos

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [pnpm Workspace Guide](https://pnpm.io/workspaces/)

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie sua branch: `git checkout -b feature/minha-feature`
3. Abra o pull request com a descrição das mudanças

## 📄 Licença

Este projeto está licenciado sob a MIT License.
