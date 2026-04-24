import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './db/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import profilesRoutes from './routes/profiles.js';
import articlesRoutes from './routes/articles.js';
import commentsRoutes from './routes/comments.js';
import favoritesRoutes from './routes/favorites.js';
import tagsRoutes from './routes/tags.js';

// Run migrations on startup
migrate(db, { migrationsFolder: './drizzle' });

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.route('/api', authRoutes);
app.route('/api', userRoutes);
app.route('/api', profilesRoutes);
app.route('/api', articlesRoutes);
app.route('/api', commentsRoutes);
app.route('/api', favoritesRoutes);
app.route('/api', tagsRoutes);

const port = Number(process.env.PORT ?? 8000);
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});
