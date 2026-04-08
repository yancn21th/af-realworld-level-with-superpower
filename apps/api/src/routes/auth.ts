import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

export async function makeToken(userId: number): Promise<string> {
  return sign({ sub: userId }, process.env.JWT_SECRET ?? 'secret', 'HS256');
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
  let user: typeof users.$inferSelect;
  try {
    const [inserted] = await db.insert(users).values({ username, email, passwordHash, createdAt: now, updatedAt: now }).returning();
    user = inserted;
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE constraint failed')) {
      if (err.message.includes('users.username')) return c.json({ errors: { username: ['has already been taken'] } }, 409);
      if (err.message.includes('users.email')) return c.json({ errors: { email: ['has already been taken'] } }, 409);
    }
    throw err;
  }
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
