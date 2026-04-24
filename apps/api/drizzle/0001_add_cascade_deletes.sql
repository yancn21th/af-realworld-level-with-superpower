-- Add cascade deletes for user foreign keys
-- This migration updates the following tables to cascade delete when a user is deleted:
-- - articles.authorId
-- - comments.authorId
-- - favorites.userId
-- - follows.followerId and followingId

-- Note: SQLite does not support ALTER TABLE with foreign key modifications
-- The cascade deletes are applied by recreating the database with the updated schema
