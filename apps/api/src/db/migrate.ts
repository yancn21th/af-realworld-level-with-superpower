import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database(process.env.DATABASE_URL ?? 'conduit.db');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations complete');
sqlite.close();
