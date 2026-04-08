import { eq, and, asc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { articles, articleTags, favorites, follows, users } from '../db/schema.js';

export function toISO(ms: number): string {
  return new Date(ms).toISOString();
}

export async function getArticleAuthor(authorId: number, viewerId?: number) {
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
) {
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
