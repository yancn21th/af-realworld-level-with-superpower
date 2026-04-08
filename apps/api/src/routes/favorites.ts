import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { articles, favorites } from '../db/schema.js';
import { requireAuth, type AuthEnv } from '../middleware/auth.js';
import { buildArticle } from '../lib/article-helpers.js';

const router = new Hono<AuthEnv>();

// POST /articles/:slug/favorite
router.post('/articles/:slug/favorite', requireAuth, async (c) => {
  const userId = c.get('userId');
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);

  await db.insert(favorites).values({ userId, articleId: article.id }).onConflictDoNothing();
  const built = await buildArticle(article, userId, true);
  return c.json({ article: built });
});

// DELETE /articles/:slug/favorite
router.delete('/articles/:slug/favorite', requireAuth, async (c) => {
  const userId = c.get('userId');
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);

  await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.articleId, article.id)));
  const built = await buildArticle(article, userId, true);
  return c.json({ article: built });
});

export default router;
