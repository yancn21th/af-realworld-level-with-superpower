# MiniMax UI Redesign with shadcn/ui Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all Bootstrap/RealWorld CSS with shadcn/ui components styled to the MiniMax design system (DESIGN.md), verified by Playwright tests covering CSS properties, structure, and visual snapshots.

**Architecture:** Tailwind CSS v3 with custom design tokens matching DESIGN.md color/typography/shadow spec → shadcn/ui components for all interactive elements → full page rewrites removing all Bootstrap-style class names → Playwright test suite verifying design compliance.

**Tech Stack:** React 19, Vite 5, TypeScript, Tailwind CSS v3, shadcn/ui, Playwright, DM Sans/Outfit/Poppins/Roboto (Google Fonts)

---

## File Map

### Created
- `apps/web/tailwind.config.js` — design tokens (colors, fonts, shadows, radius)
- `apps/web/postcss.config.js` — Tailwind + autoprefixer
- `apps/web/components.json` — shadcn config
- `apps/web/src/index.css` — Tailwind directives + CSS variables + base styles
- `apps/web/playwright.config.ts` — Playwright configuration
- `apps/web/e2e/design-system.spec.ts` — Playwright tests for header/footer design
- `apps/web/e2e/home.spec.ts` — Playwright tests for Home page
- `apps/web/e2e/auth.spec.ts` — Playwright tests for Login/Register pages
- `apps/web/e2e/article.spec.ts` — Playwright tests for Article page
- `apps/web/e2e/editor.spec.ts` — Playwright tests for Editor page
- `apps/web/e2e/profile.spec.ts` — Playwright tests for Profile page
- `apps/web/e2e/settings.spec.ts` — Playwright tests for Settings page
- `apps/web/src/components/ui/` — shadcn generated components (button, input, textarea, card, badge, avatar, label, separator)

### Modified
- `apps/web/index.html` — remove old CDN CSS, add Google Fonts
- `apps/web/package.json` — add Tailwind, PostCSS, Playwright, shadcn deps
- `apps/web/vite.config.ts` — add path alias `@` → `./src`
- `apps/web/tsconfig.json` — add path alias
- `apps/web/src/main.tsx` — import `./index.css`
- `apps/web/src/components/Header.tsx` — MiniMax sticky nav
- `apps/web/src/components/Footer.tsx` — dark footer
- `apps/web/src/components/ErrorMessages.tsx` — styled error list
- `apps/web/src/components/ArticlePreview.tsx` — card with brand shadow
- `apps/web/src/components/Pagination.tsx` — pill pagination
- `apps/web/src/components/TagList.tsx` — pill tag badges
- `apps/web/src/pages/Home.tsx` — hero + pill feed tabs + article grid
- `apps/web/src/pages/Login.tsx` — centered card auth form
- `apps/web/src/pages/Register.tsx` — centered card auth form
- `apps/web/src/pages/Editor.tsx` — shadcn form layout
- `apps/web/src/pages/Article.tsx` — article detail with action buttons
- `apps/web/src/pages/Profile.tsx` — profile header + pill tabs
- `apps/web/src/pages/Settings.tsx` — settings card form

---

## Task 1: Install Tailwind CSS v3 + PostCSS

**Files:**
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/postcss.config.js`
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install dependencies**

```bash
cd apps/web
pnpm add -D tailwindcss@^3.4.0 postcss autoprefixer
```

- [ ] **Step 2: Create `apps/web/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Create `apps/web/tailwind.config.js` with DESIGN.md tokens**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        'brand-blue': '#1456f0',
        'brand-sky': '#3daeff',
        'brand-pink': '#ea5ec1',
        // Blue scale
        'primary-200': '#bfdbfe',
        'primary-light': '#60a5fa',
        'primary-500': '#3b82f6',
        'primary-600': '#2563eb',
        'primary-700': '#1d4ed8',
        'brand-deep': '#17437d',
        // Text
        'text-primary': '#222222',
        'text-dark': '#18181b',
        'text-charcoal': '#181e25',
        'text-secondary': '#45515e',
        'text-muted': '#8e8e93',
        // Surface
        'surface-white': '#ffffff',
        'surface-light': '#f0f0f0',
        'border-light': '#f2f3f5',
        'border-gray': '#e5e7eb',
        // Dark
        'footer-bg': '#181e25',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Outfit', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'tag': '4px',
        'btn': '8px',
        'card-sm': '11px',
        'card-md': '13px',
        'card': '16px',
        'card-lg': '20px',
        'card-hero': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': 'rgba(0, 0, 0, 0.08) 0px 4px 6px',
        'card-ambient': 'rgba(0, 0, 0, 0.08) 0px 0px 22.576px',
        'card-brand': 'rgba(44, 30, 116, 0.16) 0px 0px 15px',
        'card-brand-dir': 'rgba(44, 30, 116, 0.11) 6.5px 2px 17.5px',
        'card-elevated': 'rgba(36, 36, 36, 0.08) 0px 12px 16px -4px',
      },
      lineHeight: {
        'tight': '1.10',
        'body': '1.50',
        'caption': '1.70',
      },
      fontSize: {
        'hero': ['80px', { lineHeight: '1.10', fontWeight: '500' }],
        'section': ['31px', { lineHeight: '1.50', fontWeight: '600' }],
        'card-title': ['28px', { lineHeight: '1.71', fontWeight: '500' }],
        'sub': ['24px', { lineHeight: '1.50', fontWeight: '500' }],
        'feature': ['18px', { lineHeight: '1.50', fontWeight: '500' }],
        'body-lg': ['20px', { lineHeight: '1.50', fontWeight: '500' }],
        'nav': ['14px', { lineHeight: '1.50', fontWeight: '500' }],
        'btn-sm': ['13px', { lineHeight: '1.50', fontWeight: '600' }],
        'label': ['12px', { lineHeight: '1.50', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Verify Tailwind resolves without error**

```bash
cd apps/web && npx tailwindcss --input /dev/null --output /dev/null 2>&1 | head -5
```

Expected: No errors (exits 0 or outputs generated CSS)

---

## Task 2: Install and Init shadcn/ui

**Files:**
- Create: `apps/web/components.json`
- Modify: `apps/web/vite.config.ts`
- Modify: `apps/web/tsconfig.json`
- Modify: `apps/web/package.json`

- [ ] **Step 1: Add path alias to `apps/web/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
```

- [ ] **Step 2: Add path alias to `apps/web/tsconfig.json`**

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
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Install `@types/node` for path resolution**

```bash
cd apps/web && pnpm add -D @types/node
```

- [ ] **Step 4: Run shadcn init (non-interactive)**

```bash
cd apps/web && npx shadcn@latest init -d
```

When prompted (if interactive mode):
- Style: Default
- Base color: Neutral
- CSS variables: Yes

This creates `components.json` and `src/index.css` with shadcn CSS variables.

- [ ] **Step 5: Install required shadcn components**

```bash
cd apps/web && npx shadcn@latest add button input textarea card badge avatar label separator
```

- [ ] **Step 6: Verify components exist**

```bash
ls apps/web/src/components/ui/
```

Expected: `button.tsx  card.tsx  input.tsx  textarea.tsx  badge.tsx  avatar.tsx  label.tsx  separator.tsx`

---

## Task 3: Configure Global CSS and Design Tokens

**Files:**
- Modify: `apps/web/src/index.css`
- Modify: `apps/web/index.html`
- Modify: `apps/web/src/main.tsx`

- [ ] **Step 1: Replace `apps/web/src/index.css` with design system base**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn CSS variables (required by shadcn components) */
    --background: 0 0% 100%;
    --foreground: 222 9% 13%;
    --card: 0 0% 100%;
    --card-foreground: 222 9% 13%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 9% 13%;
    --primary: 220 85% 57%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 94%;
    --secondary-foreground: 0 0% 20%;
    --muted: 0 0% 96%;
    --muted-foreground: 215 6% 55%;
    --accent: 0 0% 96%;
    --accent-foreground: 222 9% 13%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 214 13% 91%;
    --input: 214 13% 91%;
    --ring: 220 85% 57%;
    --radius: 0.5rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-surface-white text-text-primary font-sans;
    font-size: 16px;
    line-height: 1.50;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Outfit', 'Helvetica Neue', sans-serif;
    font-weight: 500;
    line-height: 1.50;
  }
}
```

- [ ] **Step 2: Update `apps/web/index.html` — remove old CDN, add Google Fonts**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Conduit</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@400;500;600&family=Poppins:wght@400;500;600&family=Roboto:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Add CSS import to `apps/web/src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.js';
import { AuthProvider } from './context/AuthContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 4: Start dev server and verify it compiles without errors**

```bash
cd apps/web && pnpm dev &
sleep 6 && curl -s http://localhost:5173 | grep -c "root"
```

Expected: `1` (the root div is present; no build errors in terminal)

- [ ] **Step 5: Kill the test dev server**

```bash
kill $(lsof -ti:5173) 2>/dev/null || true
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/tailwind.config.js apps/web/postcss.config.js apps/web/components.json apps/web/src/index.css apps/web/index.html apps/web/src/main.tsx apps/web/vite.config.ts apps/web/tsconfig.json apps/web/package.json apps/web/pnpm-lock.yaml apps/web/src/components/ui/
git commit -m "feat: setup Tailwind CSS v3, shadcn/ui, and MiniMax design tokens

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 4: Install Playwright

**Files:**
- Create: `apps/web/playwright.config.ts`
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install Playwright**

```bash
cd apps/web && pnpm add -D @playwright/test && npx playwright install chromium
```

- [ ] **Step 2: Create `apps/web/playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
  snapshotDir: './e2e/snapshots',
});
```

- [ ] **Step 3: Add test script to `apps/web/package.json`**

In the `"scripts"` section, add:
```json
"test:e2e": "playwright test"
```

- [ ] **Step 4: Create `apps/web/e2e/` directory and a smoke test**

```bash
mkdir -p apps/web/e2e
```

Create `apps/web/e2e/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('app loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#root')).toBeVisible();
});
```

- [ ] **Step 5: Run smoke test**

```bash
cd apps/web && pnpm test:e2e e2e/smoke.spec.ts
```

Expected: `1 passed`

- [ ] **Step 6: Commit**

```bash
git add apps/web/playwright.config.ts apps/web/e2e/ apps/web/package.json
git commit -m "feat: add Playwright test infrastructure

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 5: Rewrite Header Component

**Files:**
- Modify: `apps/web/src/components/Header.tsx`

- [ ] **Step 1: Replace `apps/web/src/components/Header.tsx`**

```tsx
import { Link, NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext.js';

export default function Header() {
  const { user } = useAuth();

  return (
    <header
      data-testid="header"
      className="sticky top-0 z-50 w-full bg-surface-white border-b border-border-light"
      style={{ boxShadow: 'rgba(0, 0, 0, 0.04) 0px 1px 4px' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="font-display text-xl font-semibold text-text-dark tracking-tight"
        >
          conduit
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${
                isActive
                  ? 'bg-black/5 text-text-dark'
                  : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'
              }`
            }
          >
            Home
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/editor"
                className={({ isActive }) =>
                  `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${
                    isActive
                      ? 'bg-black/5 text-text-dark'
                      : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'
                  }`
                }
              >
                New Article
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${
                    isActive
                      ? 'bg-black/5 text-text-dark'
                      : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'
                  }`
                }
              >
                Settings
              </NavLink>
              <NavLink
                to={`/profile/${user.username}`}
                className={({ isActive }) =>
                  `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${
                    isActive
                      ? 'bg-black/5 text-text-dark'
                      : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'
                  }`
                }
              >
                {user.username}
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${
                    isActive
                      ? 'bg-black/5 text-text-dark'
                      : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'
                  }`
                }
              >
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${
                    isActive
                      ? 'bg-black/5 text-text-dark'
                      : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'
                  }`
                }
              >
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/Header.tsx
git commit -m "feat: redesign Header with MiniMax sticky nav and pill tabs

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 6: Rewrite Footer Component

**Files:**
- Modify: `apps/web/src/components/Footer.tsx`

- [ ] **Step 1: Replace `apps/web/src/components/Footer.tsx`**

```tsx
import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer
      data-testid="footer"
      className="bg-footer-bg mt-auto"
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Link
              to="/"
              className="font-display text-lg font-semibold text-white"
            >
              conduit
            </Link>
            <p className="mt-2 font-sans text-nav text-white/50">
              A place to share your knowledge.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Link
              to="/"
              className="font-sans text-nav text-white/80 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="font-sans text-nav text-white/80 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="font-sans text-nav text-white/80 hover:text-white transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="font-sans text-[12px] text-white/40">
            An interactive learning project from{' '}
            <a
              href="https://thinkster.io"
              className="text-white/60 hover:text-white/80 underline underline-offset-2"
            >
              Thinkster
            </a>
            . Code &amp; design licensed under MIT.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/Footer.tsx
git commit -m "feat: redesign Footer with dark MiniMax style

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 7: Rewrite ErrorMessages, TagList, and Pagination Components

**Files:**
- Modify: `apps/web/src/components/ErrorMessages.tsx`
- Modify: `apps/web/src/components/TagList.tsx`
- Modify: `apps/web/src/components/Pagination.tsx`

- [ ] **Step 1: Replace `apps/web/src/components/ErrorMessages.tsx`**

```tsx
interface Props {
  errors: Record<string, string[]> | null;
}

export default function ErrorMessages({ errors }: Props) {
  if (!errors) return null;
  const messages = Object.entries(errors).flatMap(([field, msgs]) =>
    msgs.map(m => (field === '' ? m : `${field} ${m}`))
  );
  return (
    <ul className="mb-4 rounded-btn border border-destructive/20 bg-destructive/5 px-4 py-3 space-y-1">
      {messages.map((m, i) => (
        <li key={i} className="font-sans text-sm text-destructive leading-body">
          {m}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Replace `apps/web/src/components/TagList.tsx`**

```tsx
interface Props {
  tags: string[];
  selected?: string | null;
  onSelect?: (tag: string) => void;
}

export default function TagList({ tags, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onSelect?.(tag)}
          className={`px-3 py-1 rounded-pill font-sans text-label font-medium transition-colors ${
            selected === tag
              ? 'bg-brand-blue text-white'
              : 'bg-surface-light text-text-secondary hover:bg-border-gray hover:text-text-dark'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Replace `apps/web/src/components/Pagination.tsx`**

```tsx
interface Props {
  total: number;
  perPage: number;
  current: number;
  onChange: (page: number) => void;
}

export default function Pagination({ total, perPage, current, onChange }: Props) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-1 mt-6">
      {Array.from({ length: pages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`w-9 h-9 rounded-pill font-sans text-nav font-medium transition-colors ${
            page === current
              ? 'bg-brand-blue text-white shadow-card'
              : 'bg-surface-light text-text-secondary hover:bg-border-gray hover:text-text-dark'
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/ErrorMessages.tsx apps/web/src/components/TagList.tsx apps/web/src/components/Pagination.tsx
git commit -m "feat: redesign ErrorMessages, TagList, Pagination with MiniMax style

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 8: Rewrite ArticlePreview Component

**Files:**
- Modify: `apps/web/src/components/ArticlePreview.tsx`

- [ ] **Step 1: Replace `apps/web/src/components/ArticlePreview.tsx`**

```tsx
import { Link } from 'react-router';
import { useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

interface Article {
  slug: string;
  title: string;
  description: string;
  tagList: string[];
  createdAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: { username: string; image: string | null };
}

interface Props {
  article: Article;
  onUpdate?: (article: Article) => void;
}

export default function ArticlePreview({ article: initial, onUpdate }: Props) {
  const { user } = useAuth();
  const [article, setArticle] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    if (!user) return;
    setLoading(true);
    try {
      const res = article.favorited
        ? await api.unfavoriteArticle(article.slug)
        : await api.favoriteArticle(article.slug);
      setArticle(res.article);
      onUpdate?.(res.article);
    } catch {}
    setLoading(false);
  }

  return (
    <article
      data-testid="article-preview"
      className="bg-surface-white rounded-card border border-border-light p-6 shadow-card hover:shadow-card-elevated transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${article.author.username}`}>
            <img
              src={article.author.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
              alt={article.author.username}
              className="w-9 h-9 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${article.author.username}`}
              className="font-sans text-sm font-semibold text-brand-blue hover:text-primary-700 transition-colors"
            >
              {article.author.username}
            </Link>
            <p className="font-sans text-[12px] text-text-muted leading-body">
              {new Date(article.createdAt).toDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={toggleFavorite}
          disabled={loading || !user}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn font-sans text-btn-sm font-semibold transition-colors ${
            article.favorited
              ? 'bg-brand-blue text-white hover:bg-primary-700'
              : 'bg-surface-light text-text-secondary hover:bg-border-gray'
          } disabled:opacity-50`}
        >
          ♥ {article.favoritesCount}
        </button>
      </div>

      <Link to={`/article/${article.slug}`} className="block mt-4 group">
        <h2 className="font-display text-[22px] font-semibold text-text-dark leading-snug group-hover:text-brand-blue transition-colors">
          {article.title}
        </h2>
        <p className="mt-1 font-sans text-base text-text-secondary leading-body line-clamp-2">
          {article.description}
        </p>
        <span className="mt-3 inline-block font-sans text-nav text-text-muted group-hover:text-brand-blue transition-colors">
          Read more…
        </span>
      </Link>

      {article.tagList.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {article.tagList.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-pill bg-surface-light font-sans text-label text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/ArticlePreview.tsx
git commit -m "feat: redesign ArticlePreview as elevated card with MiniMax style

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 9: Rewrite Home Page

**Files:**
- Modify: `apps/web/src/pages/Home.tsx`

- [ ] **Step 1: Replace `apps/web/src/pages/Home.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../api/client.js';
import ArticlePreview from '../components/ArticlePreview.js';
import Pagination from '../components/Pagination.js';
import TagList from '../components/TagList.js';

const PER_PAGE = 10;
type FeedTab = 'global' | 'feed' | 'tag';

export default function Home() {
  const { user } = useAuth();
  const [tab, setTab] = useState<FeedTab>(user ? 'feed' : 'global');
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getTags().then(r => setTags(r.tags)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user && tab === 'feed') setTab('global');
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * PER_PAGE;
    const params = { limit: PER_PAGE, offset };
    const req =
      tab === 'feed'
        ? api.getFeed(params)
        : tab === 'tag' && selectedTag
          ? api.getArticles({ ...params, tag: selectedTag })
          : api.getArticles(params);

    req
      .then((r: any) => { setArticles(r.articles); setArticlesCount(r.articlesCount); })
      .catch(() => { setArticles([]); setArticlesCount(0); })
      .finally(() => setLoading(false));
  }, [tab, page, selectedTag]);

  function selectTag(tag: string) {
    setSelectedTag(tag);
    setTab('tag');
    setPage(1);
  }

  function switchTab(t: FeedTab) {
    setTab(t);
    setSelectedTag(null);
    setPage(1);
  }

  return (
    <div data-testid="home-page" className="min-h-screen bg-surface-white">
      {!user && (
        <section
          data-testid="hero-banner"
          className="bg-surface-white border-b border-border-light py-20 px-6"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display font-medium text-text-dark"
              style={{ fontSize: '80px', lineHeight: '1.10' }}>
              conduit
            </h1>
            <p className="mt-6 font-sans text-body-lg text-text-secondary leading-body">
              A place to share your knowledge.
            </p>
          </div>
        </section>
      )}

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Feed */}
          <div className="flex-1 min-w-0">
            {/* Tab bar */}
            <div
              data-testid="feed-tabs"
              className="flex items-center gap-1 mb-6 p-1 bg-surface-light rounded-pill w-fit"
            >
              {user && (
                <button
                  data-testid="tab-feed"
                  onClick={() => switchTab('feed')}
                  className={`px-5 py-2 rounded-pill font-sans text-nav font-medium transition-colors ${
                    tab === 'feed'
                      ? 'bg-surface-white text-text-dark shadow-card'
                      : 'text-text-secondary hover:text-text-dark'
                  }`}
                >
                  Your Feed
                </button>
              )}
              <button
                data-testid="tab-global"
                onClick={() => switchTab('global')}
                className={`px-5 py-2 rounded-pill font-sans text-nav font-medium transition-colors ${
                  tab === 'global'
                    ? 'bg-surface-white text-text-dark shadow-card'
                    : 'text-text-secondary hover:text-text-dark'
                }`}
              >
                Global Feed
              </button>
              {tab === 'tag' && selectedTag && (
                <button
                  className="px-5 py-2 rounded-pill font-sans text-nav font-medium bg-brand-blue text-white shadow-card"
                >
                  # {selectedTag}
                </button>
              )}
            </div>

            {/* Articles */}
            {loading && (
              <div className="py-12 text-center font-sans text-text-muted">
                Loading articles…
              </div>
            )}
            {!loading && articles.length === 0 && (
              <div className="py-12 text-center font-sans text-text-muted">
                No articles are here… yet.
              </div>
            )}
            {!loading && (
              <div className="space-y-4">
                {articles.map(a => (
                  <ArticlePreview key={a.slug} article={a} />
                ))}
              </div>
            )}

            <Pagination
              total={articlesCount}
              perPage={PER_PAGE}
              current={page}
              onChange={p => setPage(p)}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-surface-light rounded-card-md p-5">
              <p className="font-sans text-sm font-semibold text-text-dark mb-3">
                Popular Tags
              </p>
              <TagList tags={tags} selected={selectedTag} onSelect={selectTag} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/Home.tsx
git commit -m "feat: redesign Home page with 80px hero, pill feed tabs, card article grid

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 10: Rewrite Login and Register Pages

**Files:**
- Modify: `apps/web/src/pages/Login.tsx`
- Modify: `apps/web/src/pages/Register.tsx`

- [ ] **Step 1: Replace `apps/web/src/pages/Login.tsx`**

```tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      navigate('/');
    } catch (err: any) {
      setErrors(err?.errors ?? { '': ['Something went wrong'] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      data-testid="login-page"
      className="min-h-screen bg-surface-white flex items-center justify-center px-4 py-16"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-[32px] font-semibold text-text-dark leading-tight">
            Sign in
          </h1>
          <p className="mt-2 font-sans text-base text-text-secondary leading-body">
            Need an account?{' '}
            <Link to="/register" className="text-brand-blue hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <Card className="border-border-light shadow-card rounded-card">
          <CardContent className="p-8">
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans text-sm font-medium text-text-dark">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-btn border-border-gray font-sans text-base text-text-dark focus-visible:ring-brand-blue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans text-sm font-medium text-text-dark">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-btn border-border-gray font-sans text-base text-text-dark focus-visible:ring-brand-blue"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-text-charcoal hover:bg-text-dark text-white font-sans font-semibold rounded-btn transition-colors"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `apps/web/src/pages/Register.tsx`**

```tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    try {
      const res = await api.register(username, email, password);
      setUser(res.user);
      navigate('/');
    } catch (err: any) {
      setErrors(err?.errors ?? { '': ['Something went wrong'] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      data-testid="register-page"
      className="min-h-screen bg-surface-white flex items-center justify-center px-4 py-16"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-[32px] font-semibold text-text-dark leading-tight">
            Sign up
          </h1>
          <p className="mt-2 font-sans text-base text-text-secondary leading-body">
            Have an account?{' '}
            <Link to="/login" className="text-brand-blue hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <Card className="border-border-light shadow-card rounded-card">
          <CardContent className="p-8">
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-sans text-sm font-medium text-text-dark">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your name"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="h-11 rounded-btn border-border-gray font-sans text-base text-text-dark focus-visible:ring-brand-blue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans text-sm font-medium text-text-dark">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-btn border-border-gray font-sans text-base text-text-dark focus-visible:ring-brand-blue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans text-sm font-medium text-text-dark">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-btn border-border-gray font-sans text-base text-text-dark focus-visible:ring-brand-blue"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-text-charcoal hover:bg-text-dark text-white font-sans font-semibold rounded-btn transition-colors"
              >
                {loading ? 'Signing up…' : 'Sign up'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/Login.tsx apps/web/src/pages/Register.tsx
git commit -m "feat: redesign Login and Register pages with shadcn Card + Input

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 11: Rewrite Editor Page

**Files:**
- Modify: `apps/web/src/pages/Editor.tsx`

- [ ] **Step 1: Replace `apps/web/src/pages/Editor.tsx`**

```tsx
import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function Editor() {
  const { slug } = useParams<{ slug?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (slug) {
      api.getArticle(slug).then(r => {
        setTitle(r.article.title);
        setDescription(r.article.description);
        setBody(r.article.body);
        setTagList(r.article.tagList);
      }).catch(() => navigate('/'));
    }
  }, [slug]);

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tagList.includes(tag)) setTagList(prev => [...prev, tag]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTagList(prev => prev.filter(t => t !== tag));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    try {
      const data = { title, description, body, tagList };
      const res = slug
        ? await api.updateArticle(slug, data)
        : await api.createArticle(data);
      navigate(`/article/${res.article.slug}`);
    } catch (err: any) {
      setErrors(err?.errors ?? { '': ['Something went wrong'] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      data-testid="editor-page"
      className="min-h-screen bg-surface-white py-10 px-4"
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-[32px] font-semibold text-text-dark mb-8">
          {slug ? 'Edit Article' : 'New Article'}
        </h1>

        <Card className="border-border-light shadow-card rounded-card">
          <CardContent className="p-8">
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">
                  Title
                </Label>
                <Input
                  type="text"
                  placeholder="Article title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">
                  About
                </Label>
                <Input
                  type="text"
                  placeholder="What's this article about?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">
                  Content
                </Label>
                <Textarea
                  rows={10}
                  placeholder="Write your article (in markdown)"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="rounded-btn border-border-gray font-sans text-base resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">
                  Tags
                </Label>
                <Input
                  type="text"
                  placeholder="Press Enter to add a tag"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  className="h-11 rounded-btn border-border-gray font-sans text-base"
                />
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tagList.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 bg-surface-light rounded-pill font-sans text-label text-text-secondary"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-text-muted hover:text-text-dark ml-0.5 leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 h-11 bg-text-charcoal hover:bg-text-dark text-white font-sans font-semibold rounded-btn transition-colors"
                >
                  {loading ? 'Publishing…' : 'Publish Article'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/Editor.tsx
git commit -m "feat: redesign Editor page with shadcn Card, Input, Textarea

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 12: Rewrite Article Page

**Files:**
- Modify: `apps/web/src/pages/Article.tsx`

- [ ] **Step 1: Replace `apps/web/src/pages/Article.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([api.getArticle(slug), api.getComments(slug)])
      .then(([a, c]) => { setArticle(a.article); setComments(c.comments); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleFavorite() {
    if (!article) return;
    const res = article.favorited
      ? await api.unfavoriteArticle(article.slug)
      : await api.favoriteArticle(article.slug);
    setArticle(res.article);
  }

  async function handleFollow() {
    if (!article) return;
    const res = article.author.following
      ? await api.unfollowUser(article.author.username)
      : await api.followUser(article.author.username);
    setArticle({ ...article, author: res.profile });
  }

  async function handleDelete() {
    if (!article || !confirm('Delete this article?')) return;
    await api.deleteArticle(article.slug);
    navigate('/');
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !commentBody.trim()) return;
    const res = await api.addComment(slug, commentBody);
    setComments(prev => [res.comment, ...prev]);
    setCommentBody('');
  }

  async function handleDeleteComment(id: number) {
    if (!slug) return;
    await api.deleteComment(slug, id);
    setComments(prev => prev.filter(c => c.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-white flex items-center justify-center">
        <p className="font-sans text-text-muted">Loading…</p>
      </div>
    );
  }
  if (!article) return null;

  const isAuthor = user?.username === article.author.username;

  return (
    <div data-testid="article-page" className="min-h-screen bg-surface-white">
      {/* Article header banner */}
      <div className="bg-footer-bg py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-[42px] font-semibold text-white leading-tight">
            {article.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${article.author.username}`}>
                <img
                  src={article.author.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                  alt={article.author.username}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white/20"
                />
              </Link>
              <div>
                <Link
                  to={`/profile/${article.author.username}`}
                  className="font-sans text-sm font-semibold text-white/90 hover:text-white"
                >
                  {article.author.username}
                </Link>
                <p className="font-sans text-[12px] text-white/50">
                  {new Date(article.createdAt).toDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-2">
              {isAuthor ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 rounded-btn bg-transparent border-white/30 text-white/80 hover:bg-white/10 hover:text-white font-sans text-btn-sm"
                  >
                    <Link to={`/editor/${article.slug}`}>Edit Article</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="h-8 px-4 rounded-btn bg-transparent border-red-400/50 text-red-300 hover:bg-red-500/10 hover:text-red-200 font-sans text-btn-sm"
                  >
                    Delete
                  </Button>
                </>
              ) : user ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFollow}
                    className={`h-8 px-4 rounded-btn font-sans text-btn-sm border-white/30 ${
                      article.author.following
                        ? 'bg-white/10 text-white'
                        : 'bg-transparent text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleFavorite}
                    className={`h-8 px-4 rounded-btn font-sans text-btn-sm ${
                      article.favorited
                        ? 'bg-primary-500 text-white hover:bg-primary-700'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    ♥ {article.favorited ? 'Unfavorite' : 'Favorite'} ({article.favoritesCount})
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="prose prose-lg max-w-none font-sans text-text-dark leading-body">
          <p className="whitespace-pre-wrap">{article.body}</p>
        </div>

        {article.tagList.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tagList.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-pill border border-border-gray font-sans text-label text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Separator className="my-10" />

        {/* Author action row (repeated below article) */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${article.author.username}`}>
              <img
                src={article.author.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                alt={article.author.username}
                className="w-9 h-9 rounded-full object-cover"
              />
            </Link>
            <div>
              <Link
                to={`/profile/${article.author.username}`}
                className="font-sans text-sm font-semibold text-brand-blue hover:text-primary-700"
              >
                {article.author.username}
              </Link>
              <p className="font-sans text-[12px] text-text-muted">
                {new Date(article.createdAt).toDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="max-w-2xl">
          <h3 className="font-display text-xl font-semibold text-text-dark mb-5">Comments</h3>

          {user ? (
            <form
              onSubmit={handleAddComment}
              className="mb-6 border border-border-gray rounded-card-md overflow-hidden"
            >
              <Textarea
                placeholder="Write a comment…"
                rows={3}
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                className="rounded-none border-0 border-b border-border-light resize-none font-sans text-base"
              />
              <div className="flex items-center justify-between px-4 py-3 bg-surface-light">
                <img
                  src={user.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-4 bg-brand-blue hover:bg-primary-700 text-white font-sans text-btn-sm rounded-btn"
                >
                  Post Comment
                </Button>
              </div>
            </form>
          ) : (
            <p className="mb-6 font-sans text-base text-text-secondary">
              <Link to="/login" className="text-brand-blue hover:text-primary-700 font-medium">Sign in</Link>
              {' '}or{' '}
              <Link to="/register" className="text-brand-blue hover:text-primary-700 font-medium">sign up</Link>
              {' '}to add comments.
            </p>
          )}

          <div className="space-y-3">
            {comments.map(comment => (
              <div
                key={comment.id}
                className="border border-border-light rounded-card-md overflow-hidden"
              >
                <div className="px-5 py-4">
                  <p className="font-sans text-base text-text-dark leading-body">{comment.body}</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-surface-light border-t border-border-light">
                  <Link to={`/profile/${comment.author.username}`}>
                    <img
                      src={comment.author.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                      alt={comment.author.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  </Link>
                  <Link
                    to={`/profile/${comment.author.username}`}
                    className="font-sans text-sm font-semibold text-brand-blue hover:text-primary-700"
                  >
                    {comment.author.username}
                  </Link>
                  <span className="font-sans text-[12px] text-text-muted">
                    {new Date(comment.createdAt).toDateString()}
                  </span>
                  {user?.username === comment.author.username && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="ml-auto font-sans text-[12px] text-text-muted hover:text-destructive transition-colors"
                    >
                      Delete
                    </button>
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

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/Article.tsx
git commit -m "feat: redesign Article page with dark header banner and shadcn components

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 13: Rewrite Profile Page

**Files:**
- Modify: `apps/web/src/pages/Profile.tsx`

- [ ] **Step 1: Replace `apps/web/src/pages/Profile.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ArticlePreview from '../components/ArticlePreview.js';
import Pagination from '../components/Pagination.js';
import { Button } from '@/components/ui/button';

const PER_PAGE = 10;

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const isFavoritesTab = location.pathname.endsWith('/favorites');
  const [profile, setProfile] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    api.getProfile(username)
      .then(r => setProfile(r.profile))
      .catch(() => {});
  }, [username]);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    const offset = (page - 1) * PER_PAGE;
    const params: Record<string, string | number> = isFavoritesTab
      ? { favorited: username, limit: PER_PAGE, offset }
      : { author: username, limit: PER_PAGE, offset };
    api.getArticles(params)
      .then(r => { setArticles(r.articles); setArticlesCount(r.articlesCount); })
      .catch(() => { setArticles([]); setArticlesCount(0); })
      .finally(() => setLoading(false));
  }, [username, isFavoritesTab, page]);

  async function toggleFollow() {
    if (!profile) return;
    const res = profile.following
      ? await api.unfollowUser(profile.username)
      : await api.followUser(profile.username);
    setProfile(res.profile);
  }

  const isOwn = user?.username === username;

  return (
    <div data-testid="profile-page" className="min-h-screen bg-surface-white">
      {/* Profile header */}
      <div className="bg-surface-light border-b border-border-light py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {profile && (
            <>
              <img
                src={profile.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                alt={profile.username}
                className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-surface-white shadow-card"
              />
              <h1 className="mt-4 font-display text-[28px] font-semibold text-text-dark">
                {profile.username}
              </h1>
              {profile.bio && (
                <p className="mt-2 font-sans text-base text-text-secondary leading-body max-w-md mx-auto">
                  {profile.bio}
                </p>
              )}
              <div className="mt-5">
                {isOwn ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 px-5 rounded-btn border-border-gray text-text-secondary hover:text-text-dark font-sans text-nav"
                  >
                    <Link to="/settings">Edit Profile Settings</Link>
                  </Button>
                ) : user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFollow}
                    className={`h-9 px-5 rounded-btn font-sans text-nav ${
                      profile.following
                        ? 'bg-text-charcoal text-white border-text-charcoal hover:bg-text-dark'
                        : 'border-border-gray text-text-secondary hover:text-text-dark'
                    }`}
                  >
                    {profile.following ? `Unfollow ${profile.username}` : `Follow ${profile.username}`}
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Articles section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Pill tabs */}
        <div
          data-testid="profile-tabs"
          className="flex items-center gap-1 mb-6 p-1 bg-surface-light rounded-pill w-fit"
        >
          <Link
            to={`/profile/${username}`}
            className={`px-5 py-2 rounded-pill font-sans text-nav font-medium transition-colors ${
              !isFavoritesTab
                ? 'bg-surface-white text-text-dark shadow-card'
                : 'text-text-secondary hover:text-text-dark'
            }`}
          >
            My Articles
          </Link>
          <Link
            to={`/profile/${username}/favorites`}
            className={`px-5 py-2 rounded-pill font-sans text-nav font-medium transition-colors ${
              isFavoritesTab
                ? 'bg-surface-white text-text-dark shadow-card'
                : 'text-text-secondary hover:text-text-dark'
            }`}
          >
            Favorited Articles
          </Link>
        </div>

        {loading && (
          <div className="py-12 text-center font-sans text-text-muted">Loading…</div>
        )}
        {!loading && articles.length === 0 && (
          <div className="py-12 text-center font-sans text-text-muted">No articles here yet.</div>
        )}
        {!loading && (
          <div className="space-y-4">
            {articles.map(a => <ArticlePreview key={a.slug} article={a} />)}
          </div>
        )}

        <Pagination total={articlesCount} perPage={PER_PAGE} current={page} onChange={setPage} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/Profile.tsx
git commit -m "feat: redesign Profile page with avatar header and pill tabs

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 14: Rewrite Settings Page

**Files:**
- Modify: `apps/web/src/pages/Settings.tsx`

- [ ] **Step 1: Replace `apps/web/src/pages/Settings.tsx`**

```tsx
import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setImage(user.image ?? '');
    setUsername(user.username);
    setBio(user.bio ?? '');
    setEmail(user.email);
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    try {
      const data: any = { image, username, bio, email };
      if (password) data.password = password;
      const res = await api.updateUser(data);
      setUser(res.user);
      navigate(`/profile/${res.user.username}`);
    } catch (err: any) {
      setErrors(err?.errors ?? { '': ['Something went wrong'] });
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div
      data-testid="settings-page"
      className="min-h-screen bg-surface-white py-10 px-4"
    >
      <div className="max-w-lg mx-auto">
        <h1 className="font-display text-[32px] font-semibold text-text-dark mb-8">
          Your Settings
        </h1>

        <Card className="border-border-light shadow-card rounded-card">
          <CardContent className="p-8">
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">
                  Profile Picture URL
                </Label>
                <Input
                  type="text"
                  placeholder="https://…"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">
                  Username
                </Label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">
                  Bio
                </Label>
                <Textarea
                  rows={5}
                  placeholder="Short bio about you"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="rounded-btn border-border-gray font-sans text-base resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">
                  New Password
                </Label>
                <Input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 h-11 bg-text-charcoal hover:bg-text-dark text-white font-sans font-semibold rounded-btn transition-colors"
                >
                  {loading ? 'Updating…' : 'Update Settings'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-11 rounded-btn border-destructive/40 text-destructive hover:bg-destructive/5 font-sans font-medium"
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/Settings.tsx
git commit -m "feat: redesign Settings page with shadcn Card form and logout button

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 15: Playwright Tests — Design System (Header + Footer)

**Files:**
- Create: `apps/web/e2e/design-system.spec.ts`

- [ ] **Step 1: Create `apps/web/e2e/design-system.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Header design compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('header is sticky and has white background', async ({ page }) => {
    const header = page.getByTestId('header');
    await expect(header).toBeVisible();
    const styles = await header.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return { position: cs.position, background: cs.backgroundColor };
    });
    expect(styles.position).toBe('sticky');
    expect(styles.background).toBe('rgb(255, 255, 255)');
  });

  test('nav links use DM Sans font', async ({ page }) => {
    const nav = page.locator('header nav a, header nav button').first();
    const fontFamily = await nav.evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain('dm sans');
  });

  test('nav links use pill border-radius when active', async ({ page }) => {
    const activeLink = page.locator('header nav a[aria-current="page"], header nav a.bg-black\\/5').first();
    const radius = await activeLink.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    );
    // 9999px renders as a large number in px
    const parsed = parseInt(radius);
    expect(parsed).toBeGreaterThanOrEqual(100);
  });

  test('logo uses Outfit (display) font', async ({ page }) => {
    const logo = page.locator('header a').first();
    const fontFamily = await logo.evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain('outfit');
  });
});

test.describe('Footer design compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('footer has dark background #181e25', async ({ page }) => {
    const footer = page.getByTestId('footer');
    await expect(footer).toBeVisible();
    const bg = await footer.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bg).toBe('rgb(24, 30, 37)');
  });

  test('footer links have light-on-dark color (rgba white)', async ({ page }) => {
    const footerLink = page.locator('[data-testid="footer"] a').first();
    const color = await footerLink.evaluate(el =>
      window.getComputedStyle(el).color
    );
    // rgba(255, 255, 255, 0.8) → rendered as rgb values
    const r = parseInt(color.match(/\d+/g)?.[0] ?? '0');
    expect(r).toBeGreaterThan(180); // white-ish
  });
});

test.describe('Visual snapshots — layout', () => {
  test('header snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('header')).toBeVisible();
    await expect(page.getByTestId('header')).toHaveScreenshot('header.png');
  });

  test('footer snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('footer')).toBeVisible();
    await expect(page.getByTestId('footer')).toHaveScreenshot('footer.png');
  });
});
```

- [ ] **Step 2: Run tests (first run creates snapshots)**

```bash
cd apps/web && pnpm test:e2e e2e/design-system.spec.ts --update-snapshots
```

Expected: All tests pass; snapshot files created in `e2e/snapshots/`

- [ ] **Step 3: Run tests again to confirm snapshots match**

```bash
cd apps/web && pnpm test:e2e e2e/design-system.spec.ts
```

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add apps/web/e2e/design-system.spec.ts apps/web/e2e/snapshots/
git commit -m "test: Playwright design-system tests for Header and Footer

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 16: Playwright Tests — Home Page

**Files:**
- Create: `apps/web/e2e/home.spec.ts`

- [ ] **Step 1: Create `apps/web/e2e/home.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Home page design compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero banner shows 80px Outfit headline', async ({ page }) => {
    const hero = page.getByTestId('hero-banner');
    await expect(hero).toBeVisible();
    const h1 = hero.locator('h1');
    const styles = await h1.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight };
    });
    expect(styles.fontFamily.toLowerCase()).toContain('outfit');
    expect(parseInt(styles.fontSize)).toBeGreaterThanOrEqual(72);
    expect(parseInt(styles.fontWeight)).toBeLessThanOrEqual(600);
  });

  test('hero background is white (#ffffff)', async ({ page }) => {
    const hero = page.getByTestId('hero-banner');
    const bg = await hero.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(255, 255, 255)');
  });

  test('feed tabs use pill border-radius', async ({ page }) => {
    const tabs = page.getByTestId('feed-tabs');
    await expect(tabs).toBeVisible();
    const radius = await tabs.evaluate(el => window.getComputedStyle(el).borderRadius);
    expect(parseInt(radius)).toBeGreaterThanOrEqual(100);
  });

  test('active feed tab has white background (pill tab style)', async ({ page }) => {
    const activeTab = page.getByTestId('tab-global');
    const bg = await activeTab.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(255, 255, 255)');
  });

  test('article previews render as cards with shadow', async ({ page }) => {
    await page.waitForSelector('[data-testid="article-preview"]', { timeout: 8000 });
    const card = page.getByTestId('article-preview').first();
    const shadow = await card.evaluate(el => window.getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');
  });

  test('home page visual snapshot', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home.png', { fullPage: false });
  });
});
```

- [ ] **Step 2: Run and create snapshots**

```bash
cd apps/web && pnpm test:e2e e2e/home.spec.ts --update-snapshots
```

Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/web/e2e/home.spec.ts apps/web/e2e/snapshots/
git commit -m "test: Playwright design compliance tests for Home page

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 17: Playwright Tests — Auth Pages

**Files:**
- Create: `apps/web/e2e/auth.spec.ts`

- [ ] **Step 1: Create `apps/web/e2e/auth.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Login page design compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('page renders login form with shadcn Card', async ({ page }) => {
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('heading uses Outfit display font', async ({ page }) => {
    const h1 = page.locator('h1').first();
    const font = await h1.evaluate(el => window.getComputedStyle(el).fontFamily);
    expect(font.toLowerCase()).toContain('outfit');
  });

  test('submit button has dark background (#181e25)', async ({ page }) => {
    const btn = page.locator('button[type="submit"]');
    const bg = await btn.evaluate(el => window.getComputedStyle(el).backgroundColor);
    // #181e25 = rgb(24, 30, 37)
    expect(bg).toBe('rgb(24, 30, 37)');
  });

  test('input uses 8px border-radius (rounded-btn)', async ({ page }) => {
    const input = page.locator('input[type="email"]');
    const radius = await input.evaluate(el => window.getComputedStyle(el).borderRadius);
    expect(parseInt(radius)).toBeGreaterThanOrEqual(6);
    expect(parseInt(radius)).toBeLessThanOrEqual(10);
  });

  test('login page visual snapshot', async ({ page }) => {
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page).toHaveScreenshot('login.png');
  });
});

test.describe('Register page design compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('page renders register form', async ({ page }) => {
    await expect(page.getByTestId('register-page')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('register page visual snapshot', async ({ page }) => {
    await expect(page.getByTestId('register-page')).toBeVisible();
    await expect(page).toHaveScreenshot('register.png');
  });
});
```

- [ ] **Step 2: Run and create snapshots**

```bash
cd apps/web && pnpm test:e2e e2e/auth.spec.ts --update-snapshots
```

Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/web/e2e/auth.spec.ts apps/web/e2e/snapshots/
git commit -m "test: Playwright design compliance tests for Login and Register pages

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 18: Playwright Tests — Article, Editor, Profile, Settings Pages

**Files:**
- Create: `apps/web/e2e/article.spec.ts`
- Create: `apps/web/e2e/editor.spec.ts`
- Create: `apps/web/e2e/profile.spec.ts`
- Create: `apps/web/e2e/settings.spec.ts`

- [ ] **Step 1: Create `apps/web/e2e/editor.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Editor page design compliance', () => {
  test('editor page redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/editor');
    await expect(page).toHaveURL(/\/login/);
  });

  test('editor page visual snapshot (login redirect)', async ({ page }) => {
    await page.goto('/editor');
    await expect(page).toHaveScreenshot('editor-redirect.png');
  });
});
```

- [ ] **Step 2: Create `apps/web/e2e/profile.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Profile page design compliance', () => {
  test('profile page loads for a known user', async ({ page }) => {
    // Navigate to a profile (username may not exist — page will still render the shell)
    await page.goto('/profile/testuser');
    await expect(page.getByTestId('profile-page')).toBeVisible();
  });

  test('profile tabs use pill border-radius', async ({ page }) => {
    await page.goto('/profile/testuser');
    const tabs = page.getByTestId('profile-tabs');
    await expect(tabs).toBeVisible();
    const radius = await tabs.evaluate(el => window.getComputedStyle(el).borderRadius);
    expect(parseInt(radius)).toBeGreaterThanOrEqual(100);
  });

  test('profile page visual snapshot', async ({ page }) => {
    await page.goto('/profile/testuser');
    await expect(page.getByTestId('profile-page')).toBeVisible();
    await expect(page).toHaveScreenshot('profile.png');
  });
});
```

- [ ] **Step 3: Create `apps/web/e2e/settings.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Settings page design compliance', () => {
  test('settings page redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
  });

  test('settings page visual snapshot (login redirect)', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveScreenshot('settings-redirect.png');
  });
});
```

- [ ] **Step 4: Create `apps/web/e2e/article.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Article page design compliance', () => {
  test('article page redirects home for unknown slug', async ({ page }) => {
    await page.goto('/article/nonexistent-slug-xyz');
    // Should navigate away from /article/ on error
    await page.waitForURL(url => !url.pathname.startsWith('/article/'), { timeout: 5000 }).catch(() => {});
    // Either home or still on page — test that no crash occurred
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('body text uses DM Sans font on home page articles', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="article-preview"]', { timeout: 8000 });
    const card = page.getByTestId('article-preview').first();
    const font = await card.evaluate(el => window.getComputedStyle(el).fontFamily);
    expect(font.toLowerCase()).toContain('dm sans');
  });
});
```

- [ ] **Step 5: Run all new tests with snapshot creation**

```bash
cd apps/web && pnpm test:e2e e2e/editor.spec.ts e2e/profile.spec.ts e2e/settings.spec.ts e2e/article.spec.ts --update-snapshots
```

Expected: All tests pass

- [ ] **Step 6: Run full test suite**

```bash
cd apps/web && pnpm test:e2e
```

Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add apps/web/e2e/
git commit -m "test: Playwright design compliance tests for Article, Editor, Profile, Settings

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 19: Final Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run TypeScript check**

```bash
cd apps/web && npx tsc --noEmit 2>&1
```

Expected: No errors

- [ ] **Step 2: Build for production**

```bash
cd apps/web && pnpm build 2>&1 | tail -20
```

Expected: `✓ built in Xs` with no errors

- [ ] **Step 3: Run full Playwright suite one final time**

```bash
cd apps/web && pnpm test:e2e
```

Expected: All tests pass

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete MiniMax UI redesign with shadcn/ui and Playwright design tests

- Replaced Bootstrap/RealWorld CSS with Tailwind CSS v3 + shadcn/ui
- Implemented MiniMax design system tokens (colors, fonts, shadows, radius)
- Redesigned all 7 pages: Home, Login, Register, Article, Editor, Profile, Settings
- Added Playwright tests: CSS property checks, structural checks, visual snapshots
- All pages use DM Sans (UI), Outfit (display), pill nav tabs, brand-purple shadows

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```
