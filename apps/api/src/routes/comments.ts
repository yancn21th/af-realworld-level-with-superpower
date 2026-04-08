import { Hono } from 'hono';
import { z } from 'zod';
import { eq, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { articles, comments, users, follows } from '../db/schema.js';
import { requireAuth, optionalAuth, type AuthEnv } from '../middleware/auth.js';

const router = new Hono<AuthEnv>();

async function buildComment(comment: typeof comments.$inferSelect, viewerId?: number) {
  const author = await db.query.users.findFirst({ where: eq(users.id, comment.authorId) });
  if (!author) throw new Error('Author not found');
  let following = false;
  if (viewerId) {
    const f = await db.query.follows.findFirst({
      where: (t, { and, eq: deq }) => and(deq(t.followerId, viewerId), deq(t.followingId, comment.authorId)),
    });
    following = !!f;
  }
  return {
    id: comment.id,
    createdAt: new Date(comment.createdAt).toISOString(),
    updatedAt: new Date(comment.updatedAt).toISOString(),
    body: comment.body,
    author: { username: author.username, bio: author.bio, image: author.image, following },
  };
}

// GET /articles/:slug/comments
router.get('/articles/:slug/comments', optionalAuth, async (c) => {
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);
  const rows = await db.select().from(comments).where(eq(comments.articleId, article.id)).orderBy(asc(comments.createdAt));
  const built = await Promise.all(rows.map(r => buildComment(r, c.get('userId'))));
  return c.json({ comments: built });
});

const createCommentSchema = z.object({
  comment: z.object({ body: z.string().min(1, "can't be blank") }),
});

// POST /articles/:slug/comments
router.post('/articles/:slug/comments', requireAuth, async (c) => {
  const userId = c.get('userId');
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, c.req.param('slug')) });
  if (!article) return c.json({ errors: { article: ['not found'] } }, 404);

  const body = await c.req.json().catch(() => ({}));
  const result = createCommentSchema.safeParse(body);
  if (!result.success) return c.json({ errors: { body: ["can't be blank"] } }, 422);

  const now = Date.now();
  const [comment] = await db.insert(comments)
    .values({ articleId: article.id, authorId: userId, body: result.data.comment.body, createdAt: now, updatedAt: now })
    .returning();
  const built = await buildComment(comment, userId);
  return c.json({ comment: built }, 201);
});

// DELETE /articles/:slug/comments/:id
router.delete('/articles/:slug/comments/:id', requireAuth, async (c) => {
  const userId = c.get('userId');
  const commentId = Number(c.req.param('id'));
  const comment = await db.query.comments.findFirst({ where: eq(comments.id, commentId) });
  if (!comment) return c.json({ errors: { comment: ['not found'] } }, 404);
  if (comment.authorId !== userId) return c.json({ errors: { comment: ['forbidden'] } }, 403);
  await db.delete(comments).where(eq(comments.id, commentId));
  return c.body(null, 204);
});

export default router;
