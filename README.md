# ✈ Viagens — preços de voos

Monorepo com **Next.js** (front) + **Fastify** (API) + **Drizzle/PostgreSQL**, usando a API do **Duffel** para buscar preços de voos.

```
viagens/
├── apps/
│   ├── api/   Fastify 5 + Drizzle + provider Duffel (ou mock)
│   └── web/   Next.js 16 (App Router) + Tailwind 4
└── packages/
    └── shared/  schemas Zod e tipos usados pelos dois apps
```

## Como funciona

1. **`/flights/search`** consulta o provider ao vivo (Duffel ou mock) e salva cada oferta na tabela `price_snapshots`.
2. **`/prices`** lista os preços salvos, com filtros por país/estado de origem e destino, período, faixa de preço, ordenação e paginação.
3. O front usa formulários GET: todos os filtros ficam na URL.

A API nunca fala com o Duffel diretamente nas rotas, só através da interface `FlightProvider` (`apps/api/src/providers`). Para trocar de fornecedor, basta criar outra implementação.

## Rodando localmente

Requisitos: Node 22+, pnpm 10+, Docker (ou um Postgres local).

```bash
pnpm install

# banco
pnpm db:up                 # sobe o Postgres via docker compose
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm db:migrate            # cria as tabelas
pnpm db:seed               # cadastra ~40 aeroportos (BR por UF + alguns internacionais)

# apps
pnpm dev                   # API em :3333 e web em :3000
```

- Front: http://localhost:3000
- Docs da API (Swagger): http://localhost:3333/docs

### Duffel

Sem token, a API usa o **provider mock**, que gera preços falsos e determinísticos, então dá para desenvolver tudo sem conta.

Para usar o Duffel:
1. Crie uma conta em https://app.duffel.com e gere um **test token** (começa com `duffel_test_`).
2. Coloque-o em `DUFFEL_ACCESS_TOKEN` no `apps/api/.env`.

> No modo de teste os preços **não são reais** (é um sandbox). Para preços reais, é preciso ativar a conta no Duffel.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Status e provider ativo |
| GET | `/airports?country=BR&state=SP&q=campinas` | Aeroportos |
| GET | `/flights/search?origin=BSB&destination=GRU&departureDate=2026-12-20&returnDate=&adults=1&cabinClass=economy` | Busca ao vivo + salva |
| GET | `/prices?destCountry=BR&destState=BA&from=2026-12-01&to=2026-12-31&maxPrice=1500&sort=price&page=1` | Preços coletados |

## Scripts

| Comando | O que faz |
|---|---|
| `pnpm dev` | API + web em paralelo |
| `pnpm build` | Build dos dois apps |
| `pnpm typecheck` | Checagem de tipos em todo o monorepo |
| `pnpm --filter api test` | Testes da API (Vitest + `fastify.inject`) |
| `pnpm db:generate` | Gera migração após mudar `apps/api/src/db/schema.ts` |
| `pnpm --filter api db:studio` | Abre o Drizzle Studio |
