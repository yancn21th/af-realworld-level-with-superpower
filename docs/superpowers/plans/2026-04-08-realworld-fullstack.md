# RealWorld Full-Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a spec-compliant full-stack RealWorld (Conduit) app — Hono API + React SPA + Drizzle + SQLite — that passes all Hurl API tests in `realworld/specs/api/hurl/`.

**Architecture:** pnpm monorepo with `apps/api` (Hono on Node.js, port 8000) and `apps/web` (React + Vite, port 5173), sharing types via `packages/shared`. The API is spec-driven: all routes, error shapes, and response fields are validated against the Hurl test suite in `realworld/specs/api/`.

**Tech Stack:** pnpm workspaces · Hono 4 · @hono/node-server · Drizzle ORM · better-sqlite3 · bcryptjs · nanoid · slugify · Zod · React 19 · Vite 5 · React Router 7 · TypeScript 5

> **Spec note — error shapes are field-specific:**
> - Validation: `{ errors: { fieldName: ["can't be blank"] } }`
> - Duplicate: `{ errors: { username: ["has already been taken"] } }`
> - No token: `{ errors: { token: ["is missing"] } }`
> - Bad credentials: `{ errors: { credentials: ["invalid"] } }`
> - Forbidden: `{ errors: { article: ["forbidden"] } }` or `{ errors: { comment: ["forbidden"] } }`
>
> Timestamps are stored as INTEGER (Unix ms) in SQLite but returned as ISO 8601 strings in API responses.
> `bio` and `image` fields: empty string `""` normalises to `null`.
> Article list (`GET /articles`) does **not** include the `body` field.
> Tags preserve insertion order.

---

## File Structure

```
realworld-app/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts        # Drizzle table definitions
│   │   │   │   ├── index.ts         # DB connection singleton
│   │   │   │   └── migrate.ts       # Run migrations on startup
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts          # requireAuth + optionalAuth
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts          # POST /users, POST /users/login
│   │   │   │   ├── user.ts          # GET /user, PUT /user
│   │   │   │   ├── profiles.ts      # GET/follow/unfollow /profiles/:username
│   │   │   │   ├── articles.ts      # CRUD + list + feed /articles
│   │   │   │   ├── comments.ts      # GET/POST/DELETE /articles/:slug/comments
│   │   │   │   ├── favorites.ts     # POST/DELETE /articles/:slug/favorite
│   │   │   │   └── tags.ts          # GET /tags
│   │   │   └── index.ts             # Hono app + server
│   │   ├── drizzle.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── api/
│       │   │   └── client.ts        # Typed fetch wrappers
│       │   ├── context/
│       │   │   └── AuthContext.tsx  # User + token state
│       │   ├── components/
│       │   │   ├── Header.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── ArticlePreview.tsx
│       │   │   ├── ArticleList.tsx
│       │   │   ├── Pagination.tsx
│       │   │   ├── TagList.tsx
│       │   │   └── ErrorMessages.tsx
│       │   ├── pages/
│       │   │   ├── Home.tsx
│       │   │   ├── Login.tsx
│       │   │   ├── Register.tsx
│       │   │   ├── Editor.tsx
│       │   │   ├── Article.tsx
│       │   │   ├── Profile.tsx
│       │   │   └── Settings.tsx
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       │   └── types.ts             # User, Article, Comment, Profile types
│       ├── tsconfig.json
│       └── package.json
└── package.json                     # pnpm workspace root
```

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "realworld-app",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm --filter api dev\" \"pnpm --filter web dev\"",
    "test:api": "HOST=http://localhost:8000 bash realworld/specs/api/run-api-tests-hurl.sh",
    "test:e2e": "pnpm --filter web exec playwright test"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 3: Create apps/api/package.json**

```json
{
  "name": "api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "hono": "^4.4.0",
    "@hono/node-server": "^1.12.0",
    "drizzle-orm": "^0.31.0",
    "better-sqlite3": "^9.6.0",
    "bcryptjs": "^2.4.3",
    "nanoid": "^5.0.7",
    "slugify": "^1.6.6",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.10",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.0.0",
    "drizzle-kit": "^0.22.0",
    "tsx": "^4.15.0"
  }
}
```

- [ ] **Step 4: Create apps/api/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create apps/web/package.json**

```json
{
  "name": "web",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.1.0",
    "shared": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 6: Create apps/web/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Create packages/shared/package.json**

```json
{
  "name": "shared",
  "private": true,
  "exports": {
    ".": {
      "import": "./src/types.ts"
    }
  }
}
```

- [ ] **Step 8: Create packages/shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 9: Create .gitignore**

```
node_modules/
dist/
*.db
*.db-wal
*.db-shm
.env
.superpowers/
drizzle/
```

- [ ] **Step 10: Install all dependencies**

```bash
pnpm install
```

Expected: packages installed, `node_modules` created in workspace root and each package.

- [ ] **Step 11: Commit**

```bash
git init
git add .
git commit -m "chore: monorepo scaffold with pnpm workspaces"
```

---

## Task 2: Shared TypeScript Types

**Files:**
- Create: `packages/shared/src/types.ts`

- [ ] **Step 1: Create shared types**

```typescript
// packages/shared/src/types.ts
export interface UserResponse {
  user: {
    username: string;
    email: string;
    bio: string | null;
    image: string | null;
    token: string;
  };
}

export interface ProfileResponse {
  profile: {
    username: string;
    bio: string | null;
    image: string | null;
    following: boolean;
  };
}

export interface ArticleAuthor {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: ArticleAuthor;
}

export interface ArticleListItem extends Omit<Article, 'body'> {}

export interface ArticleResponse {
  article: Article;
}

export interface ArticlesResponse {
  articles: ArticleListItem[];
  articlesCount: number;
}

export interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: ArticleAuthor;
}

export interface CommentResponse {
  comment: Comment;
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface TagsResponse {
  tags: string[];
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/types.ts
git commit -m "feat: shared TypeScript types"
```

---

## Task 3: Database Schema

**Files:**
- Create: `apps/api/src/db/schema.ts`
- Create: `apps/api/src/db/index.ts`
- Create: `apps/api/src/db/migrate.ts`
- Create: `apps/api/drizzle.config.ts`

- [ ] **Step 1: Create Drizzle schema**

```typescript
// apps/api/src/db/schema.ts
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  bio: text('bio'),
  image: text('image'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authorId: integer('author_id').notNull().references(() => users.id),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  body: text('body').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const articleTags = sqliteTable('article_tags', {
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
  position: integer('position').notNull().default(0),
}, (t) => ({ pk: primaryKey({ columns: [t.articleId, t.tag] }) }));

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => users.id),
  body: text('body').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const favorites = sqliteTable('favorites', {
  userId: integer('user_id').notNull().references(() => users.id),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
}, (t) => ({ pk: primaryKey({ columns: [t.userId, t.articleId] }) }));

export const follows = sqliteTable('follows', {
  followerId: integer('follower_id').notNull().references(() => users.id),
  followingId: integer('following_id').notNull().references(() => users.id),
}, (t) => ({ pk: primaryKey({ columns: [t.followerId, t.followingId] }) }));
```

> Note: `articleTags` uses a `position` column to preserve tag insertion order. When inserting tags, set `position` to the index (0, 1, 2…). Query with `.orderBy(asc(articleTags.position))`.

- [ ] **Step 2: Create DB connection**

```typescript
// apps/api/src/db/index.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

const sqlite = new Database(process.env.DATABASE_URL ?? 'conduit.db');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
```

- [ ] **Step 3: Create migration runner**

```typescript
// apps/api/src/db/migrate.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database(process.env.DATABASE_URL ?? 'conduit.db');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations complete');
sqlite.close();
```

- [ ] **Step 4: Create drizzle.config.ts**

```typescript
// apps/api/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'conduit.db' },
});
```

- [ ] **Step 5: Generate and apply migrations**

```bash
cd apps/api
pnpm db:generate
pnpm db:push
```

Expected: `drizzle/` folder created with SQL migration files; `conduit.db` created with all 6 tables.

- [ ] **Step 6: Commit**

```bash
cd ../..
git add apps/api/src/db/ apps/api/drizzle.config.ts apps/api/drizzle/
git commit -m "feat: drizzle schema and sqlite setup"
```

---

## Task 4: Hono Server and Auth Middleware

**Files:**
- Create: `apps/api/src/middleware/auth.ts`
- Create: `apps/api/src/index.ts`

- [ ] **Step 1: Create auth middleware**

```typescript
// apps/api/src/middleware/auth.ts
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';

export type AuthEnv = { Variables: { userId: number } };

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Token ')) {
    return c.json({ errors: { token: ['is missing'] } }, 401);
  }
  try {
    const token = header.slice(6);
    const payload = await verify(token, process.env.JWT_SECRET ?? 'secret');
    c.set('userId', payload.sub as number);
    await next();
  } catch {
    return c.json({ errors: { token: ['is invalid'] } }, 401);
  }
});

export const optionalAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const header = c.req.header('Authorization');
  if (header?.startsWith('Token ')) {
    try {
      const token = header.slice(6);
      const payload = await verify(token, process.env.JWT_SECRET ?? 'secret');
      c.set('userId', payload.sub as number);
    } catch { /* no-op — unauthenticated request proceeds */ }
  }
  await next();
});
```

- [ ] **Step 2: Create Hono server entry point**

```typescript
// apps/api/src/index.ts
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import profilesRoutes from './routes/profiles.js';
import articlesRoutes from './routes/articles.js';
import commentsRoutes from './routes/comments.js';
import favoritesRoutes from './routes/favorites.js';
import tagsRoutes from './routes/tags.js';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.route('/api', authRoutes);
app.route('/api', userRoutes);
app.route('/api', profilesRoutes);
app.route('/api', articlesRoutes);
app.route('/api', commentsRoutes);
app.route('/api', favoritesRoutes);
app.route('/api', tagsRoutes);

const port = Number(process.env.PORT ?? 8000);
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

- [ ] **Step 3: Verify server starts (routes will 404 until implemented)**

```bash
cd apps/api
pnpm dev
```

Expected: `Server running on http://localhost:8000` — no crash.

Stop the server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
cd ../..
git add apps/api/src/middleware/ apps/api/src/index.ts
git commit -m "feat: hono server + auth middleware"
```

---

## Task 5: Auth Routes (Register + Login + Get/Update User)

**Files:**
- Create: `apps/api/src/routes/auth.ts`
- Create: `apps/api/src/routes/user.ts`

Hurl tests: `realworld/specs/api/hurl/auth.hurl`, `realworld/specs/api/hurl/errors_auth.hurl`

- [ ] **Step 1: Create a helper to make JWT tokens**

This goes at the top of `apps/api/src/routes/auth.ts`. The full file:

```typescript
// apps/api/src/routes/auth.ts
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

export async function makeToken(userId: number): Promise<string> {
  return sign({ sub: userId }, process.env.JWT_SECRET ?? 'secret');
}

const router = new Hono();

const registerSchema = z.object({
  user: z.object({
    username: z.string().min(1, "can't be blank"),
    email: z.string().min(1, "can't be blank"),
    password: z.string().min(1, "can't be blank"),
  }),
});

router.post('/users', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[1] ?? 'body');
      errors[field] = [issue.message];
    }
    return c.json({ errors }, 422);
  }
  const { username, email, password } = result.data.user;

  const dupUsername = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (dupUsername) return c.json({ errors: { username: ['has already been taken'] } }, 409);

  const dupEmail = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (dupEmail) return c.json({ errors: { email: ['has already been taken'] } }, 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const now = Date.now();
  const [user] = await db.insert(users).values({ username, email, passwordHash, createdAt: now, updatedAt: now }).returning();
  const token = await makeToken(user.id);
  return c.json({ user: { username: user.username, email: user.email, bio: null, image: null, token } }, 201);
});

const loginSchema = z.object({
  user: z.object({
    email: z.string().min(1, "can't be blank"),
    password: z.string().min(1, "can't be blank"),
  }),
});

router.post('/users/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[1] ?? 'body');
      errors[field] = [issue.message];
    }
    return c.json({ errors }, 422);
  }
  const { email, password } = result.data.user;
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return c.json({ errors: { credentials: ['invalid'] } }, 401);
  }
  const token = await makeToken(user.id);
  return c.json({ user: { username: user.username, email: user.email, bio: user.bio, image: user.image, token } });
});

export default router;
```

- [ ] **Step 2: Create user routes (GET /user, PUT /user)**

```typescript
// apps/api/src/routes/user.ts
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { requireAuth, type AuthEnv } from '../middleware/auth.js';
import { makeToken } from './auth.js';

const router = new Hono<AuthEnv>();

router.get('/user', requireAuth, async (c) => {
  const userId = c.get('userId');
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return c.json({ errors: { token: ['is invalid'] } }, 401);
  const token = await makeToken(user.id);
  return c.json({ user: { username: user.username, email: user.email, bio: user.bio, image: user.image, token } });
});

const updateSchema = z.object({
  user: z.object({
    username: z.string().min(1, "can't be blank").optional(),
    email: z.string().min(1, "can't be blank").optional(),
    password: z.string().min(1, "can't be blank").optional(),
    bio: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }).refine(
    (u) => u.username !== null && u.email !== null,
    { message: "can't be blank" }
  ),
});

router.put('/user', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));

  // Reject explicit null for username/email
  const raw = (body as any)?.user ?? {};
  if (raw.username === null) return c.json({ errors: { username: ["can't be blank"] } }, 422);
  if (raw.email === null) return c.json({ errors: { email: ["can't be blank"] } }, 422);
  if (raw.username === '') return c.json({ errors: { username: ["can't be blank"] } }, 422);
  if (raw.email === '') return c.json({ errors: { email: ["can't be blank"] } }, 422);

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[1] ?? 'body');
      errors[field] = [issue.message];
    }
    return c.json({ errors }, 422);
  }

  const userId = c.get('userId');
  const { username, email, password, bio, image } = result.data.user;
  const updates: Partial<typeof users.$inferInsert> = { updatedAt: Date.now() };
  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (password !== undefined) updates.passwordHash = await import('bcryptjs').then(m => m.hash(password, 10));
  if (bio !== undefined) updates.bio = bio === '' ? null : bio;
  if (image !== undefined) updates.image = image === '' ? null : image;

  const [user] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
  const token = await makeToken(user.id);
  return c.json({ user: { username: user.username, email: user.email, bio: user.bio, image: user.image, token } });
});

export default router;
```

- [ ] **Step 3: Start server and run auth tests**

Terminal 1:
```bash
cd apps/api && pnpm dev
```

Terminal 2:
```bash
HOST=http://localhost:8000 bash realworld/specs/api/run-api-tests-hurl.sh realworld/specs/api/hurl/auth.hurl realworld/specs/api/hurl/errors_auth.hurl
```

Expected: All tests pass (green). If failures, read the Hurl output — it shows exactly which assert failed and the actual response.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/routes/auth.ts apps/api/src/routes/user.ts
git commit -m "feat: auth and user routes — passes auth + errors_auth hurl tests"
```

---

## Task 6: Profiles Routes

**Files:**
- Create: `apps/api/src/routes/profiles.ts`

Hurl tests: `realworld/specs/api/hurl/profiles.hurl`, `realworld/specs/api/hurl/errors_profiles.hurl`

- [ ] **Step 1: Create profiles route**

```typescript
// apps/api/src/routes/profiles.ts
import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, follows } from '../db/schema.js';
import { requireAuth, optionalAuth, type AuthEnv } from '../middleware/auth.js';

const router = new Hono<AuthEnv>();

async function getProfile(username: string, viewerId?: number) {
  const user = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (!user) return null;
  let following = false;
  if (viewerId) {
    const follow = await db.query.follows.findFirst({
      where: and(eq(follows.followerId, viewerId), eq(follows.followingId, user.id)),
    });
    following = !!follow;
  }
  return { username: user.username, bio: user.bio, image: user.image, following };
}

router.get('/profiles/:username', optionalAuth, async (c) => {
  const profile = await getProfile(c.req.param('username'), c.get('userId'));
  if (!profile) return c.json({ errors: { profile: ['not found'] } }, 404);
  return c.json({ profile });
});

router.post('/profiles/:username/follow', requireAuth, async (c) => {
  const viewerId = c.get('userId');
  const target = await db.query.users.findFirst({ where: eq(users.username, c.req.param('username')) });
  if (!target) return c.json({ errors: { profile: ['not found'] } }, 404);
  await db.insert(follows).values({ followerId: viewerId, followingId: target.id }).onConflictDoNothing();
  return c.json({ profile: { username: target.username, bio: target.bio, image: target.image, following: true } });
});

router.delete('/profiles/:username/follow', requireAuth, async (c) => {
  const viewerId = c.get('userId');
  const target = await db.query.users.findFirst({ where: eq(users.username, c.req.param('username')) });
  if (!target) return c.json({ errors: { profile: ['not found'] } }, 404);
  await db.delete(follows).where(and(eq(follows.followerId, viewerId), eq(follows.followingId, target.id)));
  return c.json({ profile: { username: target.username, bio: target.bio, image: target.image, following: false } });
});

export default router;
```

- [ ] **Step 2: Run profile tests**

```bash
HOST=http://localhost:8000 bash realworld/specs/api/run-api-tests-hurl.sh realworld/specs/api/hurl/profiles.hurl realworld/specs/api/hurl/errors_profiles.hurl
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/routes/profiles.ts
git commit -m "feat: profiles routes — passes profiles + errors_profiles hurl tests"
```

---

## Task 7: Articles Routes

**Files:**
- Create: `apps/api/src/routes/articles.ts`
- Create: `apps/api/src/lib/article-helpers.ts`

Hurl tests: `realworld/specs/api/hurl/articles.hurl`, `realworld/specs/api/hurl/errors_articles.hurl`, `realworld/specs/api/hurl/errors_authorization.hurl`, `realworld/specs/api/hurl/feed.hurl`, `realworld/specs/api/hurl/pagination.hurl`

- [ ] **Step 1: Create article helper functions**

```typescript
// apps/api/src/lib/article-helpers.ts
import { eq, and, inArray, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { articles, articleTags, favorites, follows, users } from '../db/schema.js';
import type { Article, ArticleListItem, ArticleAuthor } from 'shared';

export function toISO(ms: number): string {
  return new Date(ms).toISOString();
}

export async function getArticleAuthor(authorId: number, viewerId?: number): Promise<ArticleAuthor> {
  const author = await db.query.users.findFirst({ where: eq(users.id, authorId) });
  if (!author) throw new Error('Author not found');
  let following = false;
  if (viewerId) {
    const f = await db.query.follows.findFirst({
      where: and(eq(follows.followerId, viewerId), eq(follows.followingId, authorId)),
    });
    following = !!f;
  }
  return { username: author.username, bio: author.bio, image: author.image, following };
}

export async function getArticleTags(articleId: number): Promise<string[]> {
  const rows = await db
    .select({ tag: articleTags.tag })
    .from(articleTags)
    .where(eq(articleTags.articleId, articleId))
    .orderBy(asc(articleTags.position));
  return rows.map(r => r.tag);
}

export async function isArticleFavorited(articleId: number, userId?: number): Promise<boolean> {
  if (!userId) return false;
  const fav = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.articleId, articleId)),
  });
  return !!fav;
}

export async function getArticleFavoritesCount(articleId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(favorites)
    .where(eq(favorites.articleId, articleId));
  return result[0]?.count ?? 0;
}

export async function buildArticle(
  row: typeof articles.$inferSelect,
  viewerId?: number,
  includeBody = true
): Promise<Article | ArticleListItem> {
  const [author, tagList, favorited, favoritesCount] = await Promise.all([
    getArticleAuthor(row.authorId, viewerId),
    getArticleTags(row.id),
    isArticleFavorited(row.id, viewerId),
    getArticleFavoritesCount(row.id),
  ]);
  const base = {
    slug: row.slug,
    title: row.title,
    description: row.description,
    tagList,
    createdAt: toISO(row.createdAt),
    updatedAt: toISO(row.updatedAt),
    favorited,
    favoritesCount,
    author,
  };
  return includeBody ? { ...base, body: row.body } : base;
}
```

- [ ] **Step 2: Create articles route**

```typescript
// apps/api/src/routes/articles.ts
import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, inArray, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { db } from '../db/index.js';
import { articles, articleTags, favorites, follows, users } from '../db/schema.js';
import { requireAuth, optionalAuth, type AuthEnv } from '../middleware/auth.js';
import { buildArticle, toISO } from '../lib/article-helpers.js';

const router = new Hono<AuthEnv>();

function makeSlug(title: string): string {
  return slugify(title, { lower: true, strict: true }) + '-' + nanoid(6);
}

// GET /articles — list with optional filters: tag, author, favorited, limit, offset
router.get('/articles', optionalAuth, async (c) => {
  const { tag, author, favorited, limit = '20', offset = '0' } = c.req.query();
  const viewerId = c.get('userId');
  const lim = Math.min(Number(limit), 100);
  const off = Number(offset);

  let query = db.select().from(articles).$dynamic();

  if (author) {
    const authorUser = await db.query.users.findFirst({ where: eq(users.username, author) });
    if (!authorUser) return c.json({ articles: [], articlesCount: 0 });
    query = query.where(eq(articles.authorId, authorUser.id));
  }

  if (favorited) {
    const favUser = await db.query.users.findFirst({ where: eq(users.username, favorited) });
    if (!favUser) return c.json({ articles: [], articlesCount: 0 });
    const favRows = await db.select({ articleId: favorites.articleId }).from(favorites).where(eq(favorites.userId, favUser.id));
    const ids = favRows.map(r => r.articleId);
    if (!ids.length) return c.json({ articles: [], articlesCount: 0 });
    query = query.where(inArray(articles.id, ids));
  }

  if (tag) {
    const tagRows = await db.select({ articleId: articleTags.articleId }).from(articleTags).where(eq(articleTags.tag, tag));
    const ids = tagRows.map(r => r.articleId);
    if (!ids.length) return c.json({ articles: [], articlesCount: 0 });
    query = query.where(inArray(articles.id, ids));
  }

  const all = await query.orderBy(desc(articles.createdAt));
  const articlesCount = all.length;
  const paged = all.slice(off, off + lim);
  const built = await Promise.all(paged.map(a => buildArticle(a, viewerId, false)));
  return c.json({ articles: built, articlesCount });
});

// GET /articles/feed — auth required, follows-based
router.get('/articles/feed', requireAuth, async (c) => {
  const viewerId = c.get('userId');
  const { limit = '20', offset = '0' } = c.req.query();
  const lim = Math.min(Number(limit), 100);
  const off = Number(offset);

  const followingRows = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, viewerId));
  const followingIds = followingRows.map(r => r.followingId);
  if (!followingIds.length) return c.json({ articles: [], articlesCount: 0 });

  const all = await db.select().from(articles).where(inArray(articles.authorId, followingIds)).orderBy(desc(articles.createdAt));
  const articlesCount = all.length;
  const paged = all.slice(off, off + lim);
  const built = await Promise.all(paged.map(a => buildArticle(a, viewerId, false)));
  return c.json({ articles: built, articlesCount });
});

// POST /articles
const createSchema = z.object({
  article: z.object({
    title: z.string().min(1, "can't be blank"),
    description: z.string().min(1, "can't be blank"),
    body: z.string().min(1, "can't be blank"),
    tagList: z.array(z.string()).optional().default([]),
  }),
});

router.post('/articles', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = createSchema.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[1] ?? 'body');
      errors[field] = [issue.message];
    }
    return c.json({ errors }, 422);
  }
  const { title, description, body: articleBody, tagList } = result.data.article;
  const slug = makeSlug(title);
  const now = Date.now();
  const userId = c.get('userId');

  const [article] = await db.insert(articles)
    .values({ authorId: userId, slug, title, description, body: articleBody, createdAt: now, updatedAt: now })
    .returning();

  if (tagList.length) {
    await db.insert(articleTags).values(tagList.map((tag, position) => ({ articleId: article.id, tag, position })));
  }

  const built = await buildArticle(article, userId, true);
  return c.json({ article: built }, 201);
});

// GET /articles/:slug
router.get('/articles/:slug', optionalAuth, async (c) => {
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);
  const built = await buildArticle(article, c.get('userId'), true);
  return c.json({ article: built });
});

// PUT /articles/:slug
const updateArticleSchema = z.object({
  article: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
  }),
});

router.put('/articles/:slug', requireAuth, async (c) => {
  const userId = c.get('userId');
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);
  if (article.authorId !== userId) return c.json({ errors: { article: ['forbidden'] } }, 403);

  const body = await c.req.json().catch(() => ({}));
  const result = updateArticleSchema.safeParse(body);
  if (!result.success) return c.json({ errors: { body: ['invalid'] } }, 422);

  const { title, description, body: articleBody } = result.data.article;
  const updates: Partial<typeof articles.$inferInsert> = { updatedAt: Date.now() };
  if (title !== undefined) { updates.title = title; updates.slug = makeSlug(title); }
  if (description !== undefined) updates.description = description;
  if (articleBody !== undefined) updates.body = articleBody;

  const [updated] = await db.update(articles).set(updates).where(eq(articles.id, article.id)).returning();
  const built = await buildArticle(updated, userId, true);
  return c.json({ article: built });
});

// DELETE /articles/:slug
router.delete('/articles/:slug', requireAuth, async (c) => {
  const userId = c.get('userId');
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);
  if (article.authorId !== userId) return c.json({ errors: { article: ['forbidden'] } }, 403);
  await db.delete(articles).where(eq(articles.id, article.id));
  return c.body(null, 204);
});

export default router;
```

- [ ] **Step 3: Run article tests**

```bash
HOST=http://localhost:8000 bash realworld/specs/api/run-api-tests-hurl.sh \
  realworld/specs/api/hurl/articles.hurl \
  realworld/specs/api/hurl/errors_articles.hurl \
  realworld/specs/api/hurl/errors_authorization.hurl \
  realworld/specs/api/hurl/feed.hurl \
  realworld/specs/api/hurl/pagination.hurl
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/routes/articles.ts apps/api/src/lib/article-helpers.ts
git commit -m "feat: articles routes — passes articles, feed, pagination, authorization hurl tests"
```

---

## Task 8: Comments and Favorites Routes

**Files:**
- Create: `apps/api/src/routes/comments.ts`
- Create: `apps/api/src/routes/favorites.ts`

Hurl tests: `realworld/specs/api/hurl/comments.hurl`, `realworld/specs/api/hurl/errors_comments.hurl`, `realworld/specs/api/hurl/favorites.hurl`

- [ ] **Step 1: Create comments route**

```typescript
// apps/api/src/routes/comments.ts
import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { articles, comments, users, follows } from '../db/schema.js';
import { requireAuth, optionalAuth, type AuthEnv } from '../middleware/auth.js';
import { toISO } from '../lib/article-helpers.js';

const router = new Hono<AuthEnv>();

async function buildComment(row: typeof comments.$inferSelect, viewerId?: number) {
  const author = await db.query.users.findFirst({ where: eq(users.id, row.authorId) });
  if (!author) throw new Error('Author not found');
  let following = false;
  if (viewerId) {
    const f = await db.query.follows.findFirst({
      where: and(eq(follows.followerId, viewerId), eq(follows.followingId, author.id)),
    });
    following = !!f;
  }
  return {
    id: row.id,
    createdAt: toISO(row.createdAt),
    updatedAt: toISO(row.updatedAt),
    body: row.body,
    author: { username: author.username, bio: author.bio, image: author.image, following },
  };
}

router.get('/articles/:slug/comments', optionalAuth, async (c) => {
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);
  const rows = await db.query.comments.findMany({ where: eq(comments.articleId, article.id) });
  const built = await Promise.all(rows.map(r => buildComment(r, c.get('userId'))));
  return c.json({ comments: built });
});

const commentSchema = z.object({ comment: z.object({ body: z.string().min(1, "can't be blank") }) });

router.post('/articles/:slug/comments', requireAuth, async (c) => {
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);
  const body = await c.req.json().catch(() => ({}));
  const result = commentSchema.safeParse(body);
  if (!result.success) return c.json({ errors: { body: ["can't be blank"] } }, 422);
  const now = Date.now();
  const userId = c.get('userId');
  const [row] = await db.insert(comments)
    .values({ articleId: article.id, authorId: userId, body: result.data.comment.body, createdAt: now, updatedAt: now })
    .returning();
  return c.json({ comment: await buildComment(row, userId) }, 201);
});

router.delete('/articles/:slug/comments/:id', requireAuth, async (c) => {
  const userId = c.get('userId');
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);
  const comment = await db.query.comments.findFirst({ where: eq(comments.id, Number(c.req.param('id'))) });
  if (!comment) return c.json({ errors: { comment: ['not found'] } }, 404);
  if (comment.authorId !== userId) return c.json({ errors: { comment: ['forbidden'] } }, 403);
  await db.delete(comments).where(eq(comments.id, comment.id));
  return c.body(null, 204);
});

export default router;
```

- [ ] **Step 2: Create favorites route**

```typescript
// apps/api/src/routes/favorites.ts
import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { articles, favorites } from '../db/schema.js';
import { requireAuth, type AuthEnv } from '../middleware/auth.js';
import { buildArticle } from '../lib/article-helpers.js';

const router = new Hono<AuthEnv>();

router.post('/articles/:slug/favorite', requireAuth, async (c) => {
  const userId = c.get('userId');
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);
  await db.insert(favorites).values({ userId, articleId: article.id }).onConflictDoNothing();
  const built = await buildArticle(article, userId, true);
  return c.json({ article: built });
});

router.delete('/articles/:slug/favorite', requireAuth, async (c) => {
  const userId = c.get('userId');
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);
  await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.articleId, article.id)));
  const built = await buildArticle(article, userId, true);
  return c.json({ article: built });
});

export default router;
```

- [ ] **Step 3: Run comments and favorites tests**

```bash
HOST=http://localhost:8000 bash realworld/specs/api/run-api-tests-hurl.sh \
  realworld/specs/api/hurl/comments.hurl \
  realworld/specs/api/hurl/errors_comments.hurl \
  realworld/specs/api/hurl/favorites.hurl
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/routes/comments.ts apps/api/src/routes/favorites.ts
git commit -m "feat: comments and favorites routes — passes comments, favorites hurl tests"
```

---

## Task 9: Tags Route + Full API Test Suite

**Files:**
- Create: `apps/api/src/routes/tags.ts`

Hurl test: `realworld/specs/api/hurl/tags.hurl`

- [ ] **Step 1: Create tags route**

```typescript
// apps/api/src/routes/tags.ts
import { Hono } from 'hono';
import { db } from '../db/index.js';
import { articleTags } from '../db/schema.js';
import { sql } from 'drizzle-orm';

const router = new Hono();

router.get('/tags', async (c) => {
  const rows = await db
    .selectDistinct({ tag: articleTags.tag })
    .from(articleTags)
    .orderBy(articleTags.tag);
  return c.json({ tags: rows.map(r => r.tag) });
});

export default router;
```

- [ ] **Step 2: Run tags test**

```bash
HOST=http://localhost:8000 bash realworld/specs/api/run-api-tests-hurl.sh realworld/specs/api/hurl/tags.hurl
```

Expected: All tests pass.

- [ ] **Step 3: Run the full API test suite**

```bash
# Delete and recreate DB to start fresh
rm -f apps/api/conduit.db apps/api/conduit.db-wal apps/api/conduit.db-shm
cd apps/api && pnpm db:push && cd ../..

# Start API
cd apps/api && pnpm dev &
sleep 2

# Run all tests
pnpm test:api
```

Expected: All Hurl test files pass (auth, articles, comments, favorites, feed, pagination, profiles, tags, and all errors_* files).

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/routes/tags.ts
git commit -m "feat: tags route — full API test suite passes"
```

---

## Task 10: React + Vite Frontend Scaffold

**Files:**
- Create: `apps/web/index.html`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Copy: `realworld/assets/theme/styles.css` → `apps/web/public/styles.css`

- [ ] **Step 1: Create index.html**

```html
<!-- apps/web/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Conduit</title>
  <link href="//code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" />
  <link href="//fonts.googleapis.com/css?family=Titillium+Web:700|Source+Serif+Pro:400,700|Merriweather+Sans:400,700|Source+Sans+Pro:400,300,600,700,300italic,400italic,600italic,700italic" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Create vite.config.ts**

```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
```

- [ ] **Step 3: Copy RealWorld CSS theme**

```bash
cp realworld/assets/theme/styles.css apps/web/public/styles.css
```

- [ ] **Step 4: Create main.tsx**

```tsx
// apps/web/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from './context/AuthContext.js';
import App from './App.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 5: Create App.tsx with all routes**

```tsx
// apps/web/src/App.tsx
import { Routes, Route, Navigate } from 'react-router';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Editor from './pages/Editor.js';
import Article from './pages/Article.js';
import Profile from './pages/Profile.js';
import Settings from './pages/Settings.js';
import { useAuth } from './context/AuthContext.js';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/editor" element={<RequireAuth><Editor /></RequireAuth>} />
        <Route path="/editor/:slug" element={<RequireAuth><Editor /></RequireAuth>} />
        <Route path="/article/:slug" element={<Article />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      </Routes>
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Verify Vite starts**

```bash
cd apps/web && pnpm dev
```

Expected: Server at `http://localhost:5173` — blank page is fine (no content yet), no compile errors.

- [ ] **Step 7: Commit**

```bash
cd ../..
git add apps/web/
git commit -m "feat: react + vite scaffold with routing"
```

---

## Task 11: Auth Context and API Client

**Files:**
- Create: `apps/web/src/context/AuthContext.tsx`
- Create: `apps/web/src/api/client.ts`

- [ ] **Step 1: Create API client**

```typescript
// apps/web/src/api/client.ts
const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('jwtToken');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const t = token ?? getToken();
  if (t) headers['Authorization'] = `Token ${t}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw { status: res.status, errors: data.errors };
  return data as T;
}

export const api = {
  // Auth
  register: (username: string, email: string, password: string) =>
    request<{ user: { username: string; email: string; bio: string | null; image: string | null; token: string } }>(
      'POST', '/users', { user: { username, email, password } }
    ),
  login: (email: string, password: string) =>
    request<{ user: { username: string; email: string; bio: string | null; image: string | null; token: string } }>(
      'POST', '/users/login', { user: { email, password } }
    ),
  getCurrentUser: () =>
    request<{ user: { username: string; email: string; bio: string | null; image: string | null; token: string } }>(
      'GET', '/user'
    ),
  updateUser: (data: Partial<{ username: string; email: string; password: string; bio: string | null; image: string | null }>) =>
    request<{ user: { username: string; email: string; bio: string | null; image: string | null; token: string } }>(
      'PUT', '/user', { user: data }
    ),

  // Profiles
  getProfile: (username: string) =>
    request<{ profile: { username: string; bio: string | null; image: string | null; following: boolean } }>(
      'GET', `/profiles/${username}`
    ),
  follow: (username: string) =>
    request<{ profile: { username: string; bio: string | null; image: string | null; following: boolean } }>(
      'POST', `/profiles/${username}/follow`
    ),
  unfollow: (username: string) =>
    request<{ profile: { username: string; bio: string | null; image: string | null; following: boolean } }>(
      'DELETE', `/profiles/${username}/follow`
    ),

  // Articles
  getArticles: (params?: { tag?: string; author?: string; favorited?: string; limit?: number; offset?: number }) =>
    request<{ articles: any[]; articlesCount: number }>('GET', `/articles?${new URLSearchParams(params as any)}`),
  getFeed: (params?: { limit?: number; offset?: number }) =>
    request<{ articles: any[]; articlesCount: number }>('GET', `/articles/feed?${new URLSearchParams(params as any)}`),
  getArticle: (slug: string) => request<{ article: any }>('GET', `/articles/${slug}`),
  createArticle: (data: { title: string; description: string; body: string; tagList: string[] }) =>
    request<{ article: any }>('POST', '/articles', { article: data }),
  updateArticle: (slug: string, data: Partial<{ title: string; description: string; body: string }>) =>
    request<{ article: any }>('PUT', `/articles/${slug}`, { article: data }),
  deleteArticle: (slug: string) => request<void>('DELETE', `/articles/${slug}`),

  // Favorites
  favorite: (slug: string) => request<{ article: any }>('POST', `/articles/${slug}/favorite`),
  unfavorite: (slug: string) => request<{ article: any }>('DELETE', `/articles/${slug}/favorite`),

  // Comments
  getComments: (slug: string) => request<{ comments: any[] }>('GET', `/articles/${slug}/comments`),
  addComment: (slug: string, body: string) =>
    request<{ comment: any }>('POST', `/articles/${slug}/comments`, { comment: { body } }),
  deleteComment: (slug: string, id: number) => request<void>('DELETE', `/articles/${slug}/comments/${id}`),

  // Tags
  getTags: () => request<{ tags: string[] }>('GET', '/tags'),
};
```

- [ ] **Step 2: Create AuthContext**

```tsx
// apps/web/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../api/client.js';

interface AuthUser {
  username: string;
  email: string;
  bio: string | null;
  image: string | null;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) { setLoading(false); return; }
    api.getCurrentUser()
      .then(data => setUserState(data.user))
      .catch(() => localStorage.removeItem('jwtToken'))
      .finally(() => setLoading(false));
  }, []);

  function setUser(u: AuthUser | null) {
    setUserState(u);
    if (u) localStorage.setItem('jwtToken', u.token);
    else localStorage.removeItem('jwtToken');
  }

  function logout() { setUser(null); }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/context/ apps/web/src/api/
git commit -m "feat: auth context and typed API client"
```

---

## Task 12: Shared Components

**Files:**
- Create: `apps/web/src/components/Header.tsx`
- Create: `apps/web/src/components/Footer.tsx`
- Create: `apps/web/src/components/ErrorMessages.tsx`
- Create: `apps/web/src/components/ArticlePreview.tsx`
- Create: `apps/web/src/components/Pagination.tsx`
- Create: `apps/web/src/components/TagList.tsx`

- [ ] **Step 1: Create Header**

```tsx
// apps/web/src/components/Header.tsx
import { Link, NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext.js';

export default function Header() {
  const { user } = useAuth();
  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">conduit</Link>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
          {user ? (
            <>
              <li className="nav-item"><NavLink className="nav-link" to="/editor"><i className="ion-compose" />&nbsp;New Article</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/settings"><i className="ion-gear-a" />&nbsp;Settings</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to={`/profile/${user.username}`}>{user.username}</NavLink></li>
            </>
          ) : (
            <>
              <li className="nav-item"><NavLink className="nav-link" to="/login">Sign in</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/register">Sign up</NavLink></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create Footer**

```tsx
// apps/web/src/components/Footer.tsx
import { Link } from 'react-router';
export default function Footer() {
  return (
    <footer>
      <div className="container">
        <Link className="logo-font" to="/">conduit</Link>
        <span className="attribution">An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed under MIT.</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create ErrorMessages**

```tsx
// apps/web/src/components/ErrorMessages.tsx
export default function ErrorMessages({ errors }: { errors: Record<string, string[]> | null }) {
  if (!errors) return null;
  const messages = Object.entries(errors).flatMap(([field, msgs]) => msgs.map(m => `${field} ${m}`));
  if (!messages.length) return null;
  return (
    <ul className="error-messages">
      {messages.map((m, i) => <li key={i}>{m}</li>)}
    </ul>
  );
}
```

- [ ] **Step 4: Create ArticlePreview**

```tsx
// apps/web/src/components/ArticlePreview.tsx
import { Link } from 'react-router';
import { useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

interface Props {
  article: {
    slug: string; title: string; description: string; tagList: string[];
    createdAt: string; favorited: boolean; favoritesCount: number;
    author: { username: string; image: string | null };
  };
}

export default function ArticlePreview({ article: initial }: Props) {
  const { user } = useAuth();
  const [article, setArticle] = useState(initial);

  async function toggleFavorite() {
    if (!user) return;
    const res = article.favorited ? await api.unfavorite(article.slug) : await api.favorite(article.slug);
    setArticle(res.article);
  }

  return (
    <div className="article-preview">
      <div className="article-meta">
        <Link to={`/profile/${article.author.username}`}>
          <img src={article.author.image ?? 'https://api.realworld.io/images/smiley-cyrus.jpg'} alt={article.author.username} />
        </Link>
        <div className="info">
          <Link className="author" to={`/profile/${article.author.username}`}>{article.author.username}</Link>
          <span className="date">{new Date(article.createdAt).toDateString()}</span>
        </div>
        <button className={`btn btn-sm pull-xs-right ${article.favorited ? 'btn-primary' : 'btn-outline-primary'}`} onClick={toggleFavorite}>
          <i className="ion-heart" /> {article.favoritesCount}
        </button>
      </div>
      <Link className="preview-link" to={`/article/${article.slug}`}>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {article.tagList.map(t => <li key={t} className="tag-default tag-pill tag-outline">{t}</li>)}
        </ul>
      </Link>
    </div>
  );
}
```

- [ ] **Step 5: Create Pagination**

```tsx
// apps/web/src/components/Pagination.tsx
interface Props {
  total: number; perPage: number; current: number; onChange: (page: number) => void;
}
export default function Pagination({ total, perPage, current, onChange }: Props) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <nav>
      <ul className="pagination">
        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
          <li key={p} className={`page-item ${p === current ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onChange(p)}>{p}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 6: Create TagList**

```tsx
// apps/web/src/components/TagList.tsx
interface Props { tags: string[]; selected?: string; onSelect: (tag: string) => void; }
export default function TagList({ tags, selected, onSelect }: Props) {
  return (
    <div className="sidebar">
      <p>Popular Tags</p>
      <div className="tag-list">
        {tags.map(t => (
          <button key={t} className={`tag-pill tag-default ${selected === t ? 'tag-primary' : ''}`} onClick={() => onSelect(t)}>{t}</button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/
git commit -m "feat: shared UI components (Header, Footer, ArticlePreview, Pagination, TagList, ErrorMessages)"
```

---

## Task 13: Auth Pages (Login + Register)

**Files:**
- Create: `apps/web/src/pages/Login.tsx`
- Create: `apps/web/src/pages/Register.tsx`

- [ ] **Step 1: Create Login page**

```tsx
// apps/web/src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      navigate('/');
    } catch (err: any) {
      setErrors(err.errors ?? { body: ['An error occurred'] });
    }
  }

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center"><Link to="/register">Need an account?</Link></p>
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit}>
              <fieldset className="form-group">
                <input name="email" className="form-control form-control-lg" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              </fieldset>
              <fieldset className="form-group">
                <input name="password" className="form-control form-control-lg" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              </fieldset>
              <button className="btn btn-lg btn-primary pull-xs-right" type="submit">Sign in</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Register page**

```tsx
// apps/web/src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);
    try {
      const data = await api.register(username, email, password);
      setUser(data.user);
      navigate('/');
    } catch (err: any) {
      setErrors(err.errors ?? { body: ['An error occurred'] });
    }
  }

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign up</h1>
            <p className="text-xs-center"><Link to="/login">Have an account?</Link></p>
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit}>
              <fieldset className="form-group">
                <input name="username" className="form-control form-control-lg" type="text" placeholder="Your Name" value={username} onChange={e => setUsername(e.target.value)} />
              </fieldset>
              <fieldset className="form-group">
                <input name="email" className="form-control form-control-lg" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              </fieldset>
              <fieldset className="form-group">
                <input name="password" className="form-control form-control-lg" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              </fieldset>
              <button className="btn btn-lg btn-primary pull-xs-right" type="submit">Sign up</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/Login.tsx apps/web/src/pages/Register.tsx
git commit -m "feat: login and register pages"
```

---

## Task 14: Home Page

**Files:**
- Create: `apps/web/src/pages/Home.tsx`

- [ ] **Step 1: Create Home page**

```tsx
// apps/web/src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ArticlePreview from '../components/ArticlePreview.js';
import Pagination from '../components/Pagination.js';
import TagList from '../components/TagList.js';

const PER_PAGE = 10;
type Feed = 'global' | 'feed' | 'tag';

export default function Home() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<Feed>(user ? 'feed' : 'global');
  const [tag, setTag] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getTags().then(d => setTags(d.tags)); }, []);

  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * PER_PAGE;
    const req = feed === 'feed'
      ? api.getFeed({ limit: PER_PAGE, offset })
      : api.getArticles({ limit: PER_PAGE, offset, ...(tag ? { tag } : {}) });
    req.then(d => { setArticles(d.articles); setCount(d.articlesCount); }).finally(() => setLoading(false));
  }, [feed, tag, page]);

  function selectTag(t: string) { setTag(t); setFeed('tag'); setPage(1); }
  function selectFeed(f: Feed) { setFeed(f); setTag(undefined); setPage(1); }

  return (
    <div className="home-page">
      {!user && (
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>
      )}
      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                {user && <li className="nav-item"><button className={`nav-link ${feed === 'feed' ? 'active' : ''}`} onClick={() => selectFeed('feed')}>Your Feed</button></li>}
                <li className="nav-item"><button className={`nav-link ${feed === 'global' ? 'active' : ''}`} onClick={() => selectFeed('global')}>Global Feed</button></li>
                {tag && <li className="nav-item"><button className="nav-link active">#{tag}</button></li>}
              </ul>
            </div>
            {loading ? <p>Loading articles...</p> : articles.length === 0 ? <p>No articles are here... yet.</p> : articles.map(a => <ArticlePreview key={a.slug} article={a} />)}
            <Pagination total={count} perPage={PER_PAGE} current={page} onChange={setPage} />
          </div>
          <div className="col-md-3">
            <TagList tags={tags} selected={tag} onSelect={selectTag} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/Home.tsx
git commit -m "feat: home page with global/personal feed and tag filter"
```

---

## Task 15: Article Pages (View + Create/Edit)

**Files:**
- Create: `apps/web/src/pages/Article.tsx`
- Create: `apps/web/src/pages/Editor.tsx`

- [ ] **Step 1: Create Article view page**

```tsx
// apps/web/src/pages/Article.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentBody, setCommentBody] = useState('');

  useEffect(() => {
    if (!slug) return;
    api.getArticle(slug).then(d => setArticle(d.article));
    api.getComments(slug).then(d => setComments(d.comments));
  }, [slug]);

  async function deleteArticle() {
    if (!slug) return;
    await api.deleteArticle(slug);
    navigate('/');
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !commentBody.trim()) return;
    const res = await api.addComment(slug, commentBody);
    setComments(prev => [...prev, res.comment]);
    setCommentBody('');
  }

  async function deleteComment(id: number) {
    if (!slug) return;
    await api.deleteComment(slug, id);
    setComments(prev => prev.filter(c => c.id !== id));
  }

  if (!article) return <div className="article-page"><div className="container page">Loading...</div></div>;

  const isOwner = user?.username === article.author.username;

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <Link to={`/profile/${article.author.username}`}>
              <img src={article.author.image ?? 'https://api.realworld.io/images/smiley-cyrus.jpg'} alt="" />
            </Link>
            <div className="info">
              <Link className="author" to={`/profile/${article.author.username}`}>{article.author.username}</Link>
              <span className="date">{new Date(article.createdAt).toDateString()}</span>
            </div>
            {isOwner && (
              <>
                <Link className="btn btn-sm btn-outline-secondary" to={`/editor/${article.slug}`}><i className="ion-edit" /> Edit Article</Link>&nbsp;
                <button className="btn btn-sm btn-outline-danger" onClick={deleteArticle}><i className="ion-trash-a" /> Delete Article</button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <p className="article-content">{article.body}</p>
            <ul className="tag-list">
              {article.tagList.map((t: string) => <li key={t} className="tag-default tag-pill tag-outline">{t}</li>)}
            </ul>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            {user ? (
              <form className="card comment-form" onSubmit={submitComment}>
                <div className="card-block">
                  <textarea className="form-control" rows={3} placeholder="Write a comment..." value={commentBody} onChange={e => setCommentBody(e.target.value)} />
                </div>
                <div className="card-footer">
                  <img src={user.image ?? 'https://api.realworld.io/images/smiley-cyrus.jpg'} className="comment-author-img" alt="" />
                  <button className="btn btn-sm btn-primary" type="submit">Post Comment</button>
                </div>
              </form>
            ) : (
              <p><Link to="/login">Sign in</Link> or <Link to="/register">sign up</Link> to add comments.</p>
            )}
            {comments.map(c => (
              <div key={c.id} className="card">
                <div className="card-block"><p className="card-text">{c.body}</p></div>
                <div className="card-footer">
                  <Link className="comment-author" to={`/profile/${c.author.username}`}>{c.author.username}</Link>
                  <span className="date-posted">{new Date(c.createdAt).toDateString()}</span>
                  {user?.username === c.author.username && (
                    <span className="mod-options"><i className="ion-trash-a" onClick={() => deleteComment(c.id)} /></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Editor page (create + edit)**

```tsx
// apps/web/src/pages/Editor.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import ErrorMessages from '../components/ErrorMessages.js';

export default function Editor() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  useEffect(() => {
    if (!slug) return;
    api.getArticle(slug).then(d => {
      setTitle(d.article.title);
      setDescription(d.article.description);
      setBody(d.article.body);
      setTagList(d.article.tagList);
    });
  }, [slug]);

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const t = tagInput.trim();
      if (t && !tagList.includes(t)) setTagList(prev => [...prev, t]);
      setTagInput('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);
    try {
      const res = slug
        ? await api.updateArticle(slug, { title, description, body })
        : await api.createArticle({ title, description, body, tagList });
      navigate(`/article/${res.article.slug}`);
    } catch (err: any) {
      setErrors(err.errors ?? { body: ['An error occurred'] });
    }
  }

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit}>
              <fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="text" placeholder="Article Title" value={title} onChange={e => setTitle(e.target.value)} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control" type="text" placeholder="What's this article about?" value={description} onChange={e => setDescription(e.target.value)} />
                </fieldset>
                <fieldset className="form-group">
                  <textarea className="form-control" rows={8} placeholder="Write your article (in markdown)" value={body} onChange={e => setBody(e.target.value)} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control" type="text" placeholder="Enter tags (press Enter)" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
                  <div className="tag-list">
                    {tagList.map(t => (
                      <span key={t} className="tag-default tag-pill">
                        <i className="ion-close-round" onClick={() => setTagList(prev => prev.filter(x => x !== t))} /> {t}
                      </span>
                    ))}
                  </div>
                </fieldset>
                <button className="btn btn-lg pull-xs-right btn-primary" type="submit">Publish Article</button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/Article.tsx apps/web/src/pages/Editor.tsx
git commit -m "feat: article view and editor pages"
```

---

## Task 16: Profile and Settings Pages

**Files:**
- Create: `apps/web/src/pages/Profile.tsx`
- Create: `apps/web/src/pages/Settings.tsx`

- [ ] **Step 1: Create Profile page**

```tsx
// apps/web/src/pages/Profile.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ArticlePreview from '../components/ArticlePreview.js';
import Pagination from '../components/Pagination.js';

const PER_PAGE = 10;

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState<'authored' | 'favorited'>('authored');
  const [articles, setArticles] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!username) return;
    api.getProfile(username).then(d => setProfile(d.profile));
  }, [username]);

  useEffect(() => {
    if (!username) return;
    const offset = (page - 1) * PER_PAGE;
    const req = tab === 'authored'
      ? api.getArticles({ author: username, limit: PER_PAGE, offset })
      : api.getArticles({ favorited: username, limit: PER_PAGE, offset });
    req.then(d => { setArticles(d.articles); setCount(d.articlesCount); });
  }, [username, tab, page]);

  async function toggleFollow() {
    if (!profile) return;
    const res = profile.following ? await api.unfollow(profile.username) : await api.follow(profile.username);
    setProfile(res.profile);
  }

  if (!profile) return <div className="profile-page"><div className="container">Loading...</div></div>;

  const isOwn = user?.username === profile.username;

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <img src={profile.image ?? 'https://api.realworld.io/images/smiley-cyrus.jpg'} className="user-img" alt="" />
              <h4>{profile.username}</h4>
              <p>{profile.bio}</p>
              {!isOwn && user && (
                <button className={`btn btn-sm ${profile.following ? 'btn-secondary' : 'btn-outline-secondary'} action-btn`} onClick={toggleFollow}>
                  <i className="ion-plus-round" /> {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item"><button className={`nav-link ${tab === 'authored' ? 'active' : ''}`} onClick={() => { setTab('authored'); setPage(1); }}>My Articles</button></li>
                <li className="nav-item"><button className={`nav-link ${tab === 'favorited' ? 'active' : ''}`} onClick={() => { setTab('favorited'); setPage(1); }}>Favorited Articles</button></li>
              </ul>
            </div>
            {articles.length === 0 ? <p>No articles are here... yet.</p> : articles.map(a => <ArticlePreview key={a.slug} article={a} />)}
            <Pagination total={count} perPage={PER_PAGE} current={page} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Settings page**

```tsx
// apps/web/src/pages/Settings.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState(user?.image ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);
    try {
      const updates: any = { username, email, bio: bio || null, image: image || null };
      if (password) updates.password = password;
      const res = await api.updateUser(updates);
      setUser(res.user);
      navigate(`/profile/${res.user.username}`);
    } catch (err: any) {
      setErrors(err.errors ?? { body: ['An error occurred'] });
    }
  }

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit}>
              <fieldset>
                <fieldset className="form-group"><input className="form-control" type="url" placeholder="URL of profile picture" value={image} onChange={e => setImage(e.target.value)} /></fieldset>
                <fieldset className="form-group"><input className="form-control form-control-lg" type="text" placeholder="Your Name" value={username} onChange={e => setUsername(e.target.value)} /></fieldset>
                <fieldset className="form-group"><textarea className="form-control form-control-lg" rows={8} placeholder="Short bio about you" value={bio} onChange={e => setBio(e.target.value)} /></fieldset>
                <fieldset className="form-group"><input className="form-control form-control-lg" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /></fieldset>
                <fieldset className="form-group"><input className="form-control form-control-lg" type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} /></fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" type="submit">Update Settings</button>
              </fieldset>
            </form>
            <hr />
            <button className="btn btn-outline-danger" onClick={() => { logout(); navigate('/'); }}>Or click here to logout.</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build frontend to verify no TypeScript errors**

```bash
cd apps/web && pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
cd ../..
git add apps/web/src/pages/
git commit -m "feat: profile and settings pages — frontend complete"
```

---

## Task 17: Final Integration Verification

- [ ] **Step 1: Reset DB and restart API**

```bash
rm -f apps/api/conduit.db apps/api/conduit.db-wal apps/api/conduit.db-shm
cd apps/api && pnpm db:push
```

- [ ] **Step 2: Start both services**

```bash
pnpm dev
```

Expected: API on `:8000`, web on `:5173`. No startup errors.

- [ ] **Step 3: Run full Hurl API test suite**

```bash
pnpm test:api
```

Expected: All tests pass across all 13 hurl files (auth, articles, comments, favorites, feed, pagination, profiles, tags, errors_articles, errors_auth, errors_authorization, errors_comments, errors_profiles).

- [ ] **Step 4: Smoke-test frontend manually**

Open `http://localhost:5173` and verify:
- Home page loads with Global Feed and tag sidebar
- Register a new user → redirected to home, username in header
- Create an article → redirected to article page
- Favorite an article → count increments
- Follow a user → button changes to "Unfollow"
- Logout → Sign in / Sign up in header

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: realworld full-stack complete — all Hurl API tests passing"
```
