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
