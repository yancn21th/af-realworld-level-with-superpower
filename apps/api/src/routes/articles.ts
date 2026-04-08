import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { db } from '../db/index.js';
import { articles, articleTags, favorites, follows, users } from '../db/schema.js';
import { requireAuth, optionalAuth, type AuthEnv } from '../middleware/auth.js';
import { buildArticle } from '../lib/article-helpers.js';

const router = new Hono<AuthEnv>();

function makeSlug(title: string): string {
  return slugify(title, { lower: true, strict: true }) + '-' + nanoid(6);
}

function intersect(existing: number[] | null, incoming: number[]): number[] {
  if (existing === null) return incoming;
  return existing.filter(id => incoming.includes(id));
}

// GET /articles — list with optional filters: tag, author, favorited, limit, offset
router.get('/articles', optionalAuth, async (c) => {
  const { tag, author, favorited, limit = '20', offset = '0' } = c.req.query();
  const viewerId = c.get('userId');
  const lim = Math.min(Number(limit), 100);
  const off = Number(offset);

  let articleIds: number[] | null = null;

  if (author) {
    const authorUser = await db.query.users.findFirst({ where: eq(users.username, author) });
    if (!authorUser) return c.json({ articles: [], articlesCount: 0 });
    const rows = await db.select({ id: articles.id }).from(articles).where(eq(articles.authorId, authorUser.id));
    articleIds = intersect(articleIds, rows.map(r => r.id));
  }

  if (favorited) {
    const favUser = await db.query.users.findFirst({ where: eq(users.username, favorited) });
    if (!favUser) return c.json({ articles: [], articlesCount: 0 });
    const favRows = await db.select({ articleId: favorites.articleId }).from(favorites).where(eq(favorites.userId, favUser.id));
    const ids = favRows.map(r => r.articleId);
    if (!ids.length) return c.json({ articles: [], articlesCount: 0 });
    articleIds = intersect(articleIds, ids);
  }

  if (tag) {
    const tagRows = await db.select({ articleId: articleTags.articleId }).from(articleTags).where(eq(articleTags.tag, tag));
    const ids = tagRows.map(r => r.articleId);
    if (!ids.length) return c.json({ articles: [], articlesCount: 0 });
    articleIds = intersect(articleIds, ids);
  }

  let all;
  if (articleIds !== null) {
    if (!articleIds.length) return c.json({ articles: [], articlesCount: 0 });
    all = await db.select().from(articles).where(inArray(articles.id, articleIds)).orderBy(desc(articles.createdAt), desc(articles.id));
  } else {
    all = await db.select().from(articles).orderBy(desc(articles.createdAt), desc(articles.id));
  }

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
    tagList: z.array(z.string()).optional(),
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

  const { title, description, body: articleBody, tagList } = result.data.article;
  const updates: Partial<typeof articles.$inferInsert> = { updatedAt: Date.now() };
  if (title !== undefined) { updates.title = title; updates.slug = makeSlug(title); }
  if (description !== undefined) updates.description = description;
  if (articleBody !== undefined) updates.body = articleBody;

  const [updated] = await db.update(articles).set(updates).where(eq(articles.id, article.id)).returning();

  if (tagList !== undefined) {
    await db.delete(articleTags).where(eq(articleTags.articleId, article.id));
    if (tagList.length) {
      await db.insert(articleTags).values(tagList.map((tag, position) => ({ articleId: article.id, tag, position })));
    }
  }

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
