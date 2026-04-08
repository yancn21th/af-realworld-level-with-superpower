import { Hono } from 'hono';
import { db } from '../db/index.js';
import { articleTags } from '../db/schema.js';

const router = new Hono();

router.get('/tags', async (c) => {
  const rows = await db
    .selectDistinct({ tag: articleTags.tag })
    .from(articleTags)
    .orderBy(articleTags.tag);
  return c.json({ tags: rows.map(r => r.tag) });
});

export default router;
