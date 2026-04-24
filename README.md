# RealWorld Conduit — Built with Superpowers

A full-stack implementation of the [RealWorld](https://github.com/gothinkster/realworld) (Conduit) spec, built entirely through an **AI agent-driven workflow** known as **Superpowers**. This project demonstrates how agentic coding — spec-first design, plan-driven implementation, and automated quality assurance — can deliver a production-grade application from scratch.

## What is Superpowers?

Superpowers is an agentic development methodology where AI coding agents handle the full software delivery lifecycle:

1. **Spec** — A design document is produced describing architecture, schema, and data flow.
2. **Plan** — A step-by-step implementation plan is generated with concrete file maps, task breakdowns, and verification criteria.
3. **Execute** — Subagents implement each task autonomously, running tests after every step.
4. **QA** — Automated test suites (API + E2E) and independent review agents verify correctness continuously.

All specs, plans, and QA reports are preserved in [`docs/superpowers/`](docs/superpowers/).

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | pnpm workspaces |
| **API** | Hono 4, @hono/node-server |
| **Database** | Drizzle ORM, better-sqlite3 |
| **Auth** | bcryptjs, custom JWT middleware |
| **Validation** | Zod |
| **Frontend** | React 19, Vite 5, React Router 7 |
| **UI** | Tailwind CSS 3, shadcn/ui, Lucide icons |
| **Design** | MiniMax-inspired design system (see [DESIGN.md](DESIGN.md)) |
| **Shared** | TypeScript types package (`packages/shared`) |
| **API Tests** | Hurl (149 requests across 13 test files) |
| **E2E Tests** | Playwright |

## Project Structure

```
├── apps/
│   ├── api/          # Hono REST API (port 8000)
│   └── web/          # React SPA (port 5173)
├── packages/
│   └── shared/       # Shared TypeScript types
├── realworld/        # Official RealWorld spec & test suites
└── docs/
    ├── superpowers/  # AI-generated specs, plans
    └── qa/           # Quality assurance reports
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **hurl** (optional, for API spec tests) — [install guide](https://hurl.dev/docs/installation.html)

### Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd af-realworld-with-superpower

# 2. Install dependencies
pnpm install

# 3. Start both API and web servers
pnpm dev
```

The API server starts at `http://localhost:8000` and the web app at `http://localhost:5173`.

The SQLite database (`conduit.db`) and all tables are created automatically on first startup via Drizzle migrations — no manual setup required.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API + Web concurrently (with file watching) |
| `pnpm test:api` | Run all 149 Hurl API spec tests (requires `hurl` CLI) |
| `pnpm test:e2e` | Run Playwright E2E tests (auto-installs browsers on first run) |
| `pnpm --filter api db:migrate` | Run database migrations manually |
| `pnpm --filter api db:generate` | Generate new migration from schema changes |
| `pnpm --filter api db:push` | Push schema directly to database |

### Environment Variables

All variables have sensible defaults for local development. No `.env` file is required to get started.

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `conduit.db` | SQLite database file path |
| `PORT` | `8000` | API server port |
| `JWT_SECRET` | `secret` | JWT signing key (change in production) |

## How It Was Built

This entire codebase was produced through the Superpowers workflow in two major phases:

1. **Phase 1 — Full-Stack Implementation** (2026-04-08): Backend API + React frontend, verified against all 149 official Hurl API tests. See the [implementation plan](docs/superpowers/plans/2026-04-08-realworld-fullstack.md) and [QA report](docs/qa/2026-04-08-quality-assurance-report.md).

2. **Phase 2 — MiniMax UI Redesign** (2026-04-09): Complete UI overhaul replacing Bootstrap-style CSS with shadcn/ui components styled to a MiniMax-inspired design system, verified by Playwright visual tests. See the [redesign plan](docs/superpowers/plans/2026-04-09-minimax-ui-redesign.md).

## RealWorld Spec Compliance

The API passes all 149 requests from the official RealWorld Hurl test suite, covering:

- User registration, login, and profile management
- Article CRUD with slug generation and pagination
- Comments, favorites, tags, and follow/unfollow
- Field-level error responses matching the spec format

## License

This project is a practice implementation. The RealWorld spec is maintained by the [Thinkster](https://github.com/gothinkster/realworld) community.
