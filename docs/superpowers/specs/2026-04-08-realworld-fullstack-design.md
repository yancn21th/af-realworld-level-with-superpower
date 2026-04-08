# RealWorld Full-Stack Implementation Design

**Date:** 2026-04-08  
**Stack:** Hono · React · Drizzle ORM · SQLite  
**Spec:** [realworld/specs/](../../../realworld/specs/)  
**Primary goal:** Pass all API spec tests (Bruno/Hurl)

---

## 1. Architecture

A TypeScript monorepo with two apps and one shared package, managed with pnpm workspaces.

```
realworld-app/
├── apps/
│   ├── api/                 ← Hono backend
│   │   ├── src/
│   │   │   ├── routes/      ← auth, user, profiles, articles, comments, favorites, tags
│   │   │   ├── middleware/  ← JWT auth, error handler
│   │   │   ├── db/          ← Drizzle schema + migrations
│   │   │   └── index.ts
│   │   └── package.json
│   └── web/                 ← React + Vite SPA
│       ├── src/
│       │   ├── pages/       ← Home, Login, Register, Editor, Article, Profile, Settings
│       │   ├── components/  ← Header, Footer, ArticleList, ArticlePreview, TagList, etc.
│       │   ├── api/         ← Typed fetch wrappers
│       │   └── main.tsx
│       └── package.json
├── packages/
│   └── shared/              ← Shared TypeScript types (User, Article, Comment, Profile)
└── package.json             ← pnpm workspace root
```

**Data flow:** Browser → Hono Router → JWT Middleware → Route Handler → Drizzle ORM → SQLite

---

## 2. Database Schema

Six tables in SQLite via Drizzle ORM.

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | autoincrement |
| username | TEXT UNIQUE | |
| email | TEXT UNIQUE | |
| password_hash | TEXT | bcrypt cost 10 |
| bio | TEXT | nullable |
| image | TEXT | nullable |
| created_at | INTEGER | Unix ms |
| updated_at | INTEGER | Unix ms |

### `articles`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | autoincrement |
| author_id | INTEGER FK → users | |
| slug | TEXT UNIQUE | `slugify(title) + '-' + nanoid(6)` |
| title | TEXT | |
| description | TEXT | |
| body | TEXT | |
| created_at | INTEGER | Unix ms |
| updated_at | INTEGER | Unix ms |

### `article_tags`
| Column | Type | Notes |
|--------|------|-------|
| article_id | INTEGER FK → articles | composite PK |
| tag | TEXT | composite PK |

### `comments`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | autoincrement |
| article_id | INTEGER FK → articles | |
| author_id | INTEGER FK → users | |
| body | TEXT | |
| created_at | INTEGER | Unix ms |
| updated_at | INTEGER | Unix ms |

### `favorites`
| Column | Type | Notes |
|--------|------|-------|
| user_id | INTEGER FK → users | composite PK |
| article_id | INTEGER FK → articles | composite PK |

### `follows`
| Column | Type | Notes |
|--------|------|-------|
| follower_id | INTEGER FK → users | composite PK |
| following_id | INTEGER FK → users | composite PK |

**Key decisions:**
- Tags stored inline in `article_tags` — no separate tags table; keeps queries simple and matches the spec's flat tag list response
- Timestamps as INTEGER (Unix ms) — SQLite-native, no timezone issues
- Slugs: `slugify(title) + '-' + nanoid(6)` for uniqueness on duplicate titles
- Passwords: bcrypt, cost 10
- JWT: HS256, payload `{ sub: userId }`, secret from env `JWT_SECRET`

---

## 3. Backend — Hono API

### Route files (`apps/api/src/routes/`)

| File | Endpoints |
|------|-----------|
| `auth.ts` | `POST /users` (register), `POST /users/login` |
| `user.ts` | `GET /user`, `PUT /user` |
| `profiles.ts` | `GET /profiles/:username`, `POST/DELETE /profiles/:username/follow` |
| `articles.ts` | `GET /articles`, `GET /articles/feed`, `POST /articles`, `GET/PUT/DELETE /articles/:slug` |
| `comments.ts` | `GET/POST /articles/:slug/comments`, `DELETE /articles/:slug/comments/:id` |
| `favorites.ts` | `POST/DELETE /articles/:slug/favorite` |
| `tags.ts` | `GET /tags` |

### Middleware (`apps/api/src/middleware/`)

**`auth.middleware.ts`**
- Reads `Authorization: Token <jwt>` header
- Verifies with `JWT_SECRET`; sets `c.var.userId` on success
- Two modes: `requireAuth` (returns 401 if missing) and `optionalAuth` (skips if missing)
- Public routes use `optionalAuth`: GET /articles, GET /articles/:slug, GET /profiles/:username, GET /tags

**`error.middleware.ts`**
- All thrown errors caught here
- Response shape: `{ errors: { body: ["message"] } }`
- Status code mapping:
  - 401 — missing/invalid JWT
  - 403 — not the resource owner
  - 404 — article, user, or comment not found
  - 409 — email or username already taken
  - 422 — validation failure (Zod parse errors)

---

## 4. Frontend — React SPA

### Pages (`apps/web/src/pages/`)

| Route | Page | Auth required |
|-------|------|---------------|
| `/` | Home — global feed + tag sidebar | No (feed tabs differ) |
| `/login` | Sign In | No |
| `/register` | Sign Up | No |
| `/editor` | New Article | Yes |
| `/editor/:slug` | Edit Article | Yes (owner only) |
| `/article/:slug` | Article View | No (actions gated) |
| `/profile/:username` | User Profile | No |
| `/settings` | User Settings | Yes |

### Shared Components (`apps/web/src/components/`)

- `<Header />` — navigation, shows username/avatar when logged in
- `<Footer />` — static Conduit footer
- `<ArticleList />` — paginated list, accepts feed/global/profile/favorites props
- `<ArticlePreview />` — single article card with favorite button
- `<TagList />` — sidebar popular tags, clickable filters
- `<CommentSection />` — lists comments, post form (auth-gated)
- `<ErrorMessages />` — renders `.error-messages` ul per spec CSS
- `<Pagination />` — offset-based, 10 articles per page

### State Management

- Auth state in React Context (`AuthContext`) — stores `{ user, token }`, persisted to `localStorage` as `jwtToken`
- No global state library — local component state + context is sufficient for this app's complexity

### API Client (`apps/web/src/api/`)

Typed fetch wrappers that:
- Attach `Authorization: Token <jwt>` header when token present
- Return typed response objects matching `packages/shared/src/types.ts`
- Handle 401 by clearing token and redirecting to `/login`

---

## 5. Error Handling

**Backend:** All errors flow through `error.middleware.ts`. Route handlers throw typed errors (e.g. `new AppError(404, 'Article not found')`). Zod validation errors are caught and formatted into the `{ errors: { body: [...] } }` shape required by the API spec.

**Frontend:** API errors surface via `<ErrorMessages />` component. Invalid JWT on reload: clears `localStorage`, resets auth context, shows unauthenticated UI (no blank screen — matches E2E spec requirement in `auth.spec.ts`).

---

## 6. Testing

**Primary:** Pass the Bruno/Hurl API test suite from `realworld/specs/api/`
```bash
cd realworld/specs/api
bash run-api-tests-hurl.sh
```

**Secondary (stretch):** Pass the Playwright E2E suite from `realworld/specs/e2e/`
- auth, articles, comments, social, navigation, settings, error-handling, xss-security

**Dev workflow:**
```bash
pnpm dev          # starts api (port 3000) + web (port 5173) concurrently
pnpm test:api     # runs hurl API tests against localhost:3000
pnpm test:e2e     # runs playwright against localhost:5173
```

---

## 7. Tech Stack Summary

| Layer | Choice | Version |
|-------|--------|---------|
| Package manager | pnpm workspaces | latest |
| Backend runtime | Node.js | ≥20 |
| Backend framework | Hono | ^4 |
| ORM | Drizzle | ^0.30 |
| Database | SQLite via better-sqlite3 | ^9 |
| Auth | JWT (jose) + bcrypt | latest |
| Validation | Zod | ^3 |
| Frontend framework | React | ^19 |
| Frontend bundler | Vite | ^5 |
| Frontend routing | React Router | ^7 |
| Shared types | TypeScript package | — |
| API tests | Hurl | latest |
| E2E tests | Playwright | latest |
