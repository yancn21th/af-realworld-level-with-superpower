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
