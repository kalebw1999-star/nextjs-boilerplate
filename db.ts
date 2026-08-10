import { neon } from "@neondatabase/serverless";

let schemaReady: Promise<void> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return neon(url);
}

export function ensureSchema() {
  if (!schemaReady) {
    const db = getDb();
    schemaReady = (async () => {
      await db`CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await db`CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL
      )`;
      await db`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`;
      await db`CREATE TABLE IF NOT EXISTS attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        overall INTEGER NOT NULL,
        recruit_score INTEGER NOT NULL,
        archetype TEXT NOT NULL,
        scores JSONB NOT NULL
      )`;
      await db`CREATE INDEX IF NOT EXISTS attempts_user_id_date_idx ON attempts(user_id, date DESC)`;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}
