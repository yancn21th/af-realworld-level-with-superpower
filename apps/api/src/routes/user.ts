import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
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

router.put('/user', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const raw = (body as any)?.user ?? {};

  // Reject null or empty string for required fields
  if (raw.username === null || raw.username === '') return c.json({ errors: { username: ["can't be blank"] } }, 422);
  if (raw.email === null || raw.email === '') return c.json({ errors: { email: ["can't be blank"] } }, 422);

  const userId = c.get('userId');
  const updates: Partial<typeof users.$inferInsert> = { updatedAt: Date.now() };

  if (raw.username !== undefined) updates.username = raw.username;
  if (raw.email !== undefined) updates.email = raw.email;
  if (raw.password !== undefined && raw.password !== null && raw.password !== '') updates.passwordHash = await bcrypt.hash(raw.password, 10);
  // bio/image: normalize empty string to null
  if ('bio' in raw) updates.bio = raw.bio === '' ? null : raw.bio;
  if ('image' in raw) updates.image = raw.image === '' ? null : raw.image;

  const [user] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
  const token = await makeToken(user.id);
  return c.json({ user: { username: user.username, email: user.email, bio: user.bio, image: user.image, token } });
});

export default router;
