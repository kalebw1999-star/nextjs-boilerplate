import { neon } from "@neondatabase/serverless";

let schemaReady: Promise<void> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL ?? process.env.toke_DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL_NON_POOLING ?? process.env.NEON_DATABASE_URL;
  if (!url) throw new Error("No supported Postgres database connection variable is configured.");
  return neon(url);
}

export function ensureSchema() {
  if (!schemaReady) {
    const db = getDb();
    schemaReady = (async () => {
      await db`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
      await db`CREATE TABLE IF NOT EXISTS sessions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL)`;
      await db`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`;
      await db`CREATE TABLE IF NOT EXISTS attempts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, date TIMESTAMPTZ NOT NULL DEFAULT NOW(), overall INTEGER NOT NULL, recruit_score INTEGER NOT NULL, archetype TEXT NOT NULL, scores JSONB NOT NULL, review JSONB)`;
      await db`ALTER TABLE attempts ADD COLUMN IF NOT EXISTS review JSONB`;
      await db`CREATE TABLE IF NOT EXISTS assessment_drafts (user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), draft JSONB NOT NULL)`;
      await db`CREATE TABLE IF NOT EXISTS recruitment_status (user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, status TEXT NOT NULL DEFAULT 'none' CHECK (status IN ('none', 'waiting', 'team')), team_id TEXT NOT NULL DEFAULT 'main', updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
      await db`ALTER TABLE recruitment_status ADD COLUMN IF NOT EXISTS team_id TEXT NOT NULL DEFAULT 'main'`;
      await db`CREATE TABLE IF NOT EXISTS assessment_controls (user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, cooldown_reset_at TIMESTAMPTZ, team_lock_until TIMESTAMPTZ)`;
      await db`ALTER TABLE assessment_controls ADD COLUMN IF NOT EXISTS team_lock_until TIMESTAMPTZ`;
      await db`CREATE TABLE IF NOT EXISTS clips (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, blob_path TEXT NOT NULL UNIQUE, blob_url TEXT NOT NULL, content_type TEXT NOT NULL, size_bytes BIGINT NOT NULL, duration_seconds NUMERIC(8,2) NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'quarantine' CHECK (status IN ('quarantine','approved','rejected','deleted')), security_status TEXT NOT NULL DEFAULT 'pending' CHECK (security_status IN ('pending','passed','failed')), security_note TEXT, ai_status TEXT NOT NULL DEFAULT 'pending' CHECK (ai_status IN ('pending','processing','ready','failed')), ai_questions JSONB, player_answers JSONB, admin_review TEXT, admin_reviewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
      await db`CREATE INDEX IF NOT EXISTS clips_user_created_idx ON clips(user_id, created_at DESC)`;
      await db`CREATE INDEX IF NOT EXISTS clips_status_created_idx ON clips(status, created_at DESC)`;
      await db`CREATE TABLE IF NOT EXISTS team_memberships (user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, team_id TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('player','recruiter')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (user_id, team_id))`;
      await db`CREATE INDEX IF NOT EXISTS team_memberships_team_idx ON team_memberships(team_id, role)`;
      await db`INSERT INTO recruitment_status (user_id, status, team_id, updated_at) SELECT id, 'none', 'main', NOW() FROM users WHERE LOWER(username) = 'kynetic' ON CONFLICT (user_id) DO UPDATE SET team_id = 'main'`;
      await db`INSERT INTO team_memberships (user_id, team_id, role) SELECT id, 'main', 'recruiter' FROM users WHERE LOWER(username) = 'kynetic' ON CONFLICT (user_id, team_id) DO UPDATE SET role = 'recruiter'`;
      await db`INSERT INTO team_memberships (user_id, team_id, role) SELECT rs.user_id, COALESCE(NULLIF(rs.team_id, ''), 'main'), 'player' FROM recruitment_status rs WHERE rs.status = 'team' ON CONFLICT (user_id, team_id) DO UPDATE SET role = CASE WHEN team_memberships.role = 'recruiter' THEN 'recruiter' ELSE 'player' END`;
      await db`CREATE TABLE IF NOT EXISTS dm_threads (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, approval_status TEXT NOT NULL DEFAULT 'active' CHECK (approval_status IN ('active','pending','rejected')), requested_at TIMESTAMPTZ, approved_at TIMESTAMPTZ, last_request_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CHECK (user_a <> user_b), UNIQUE (user_a, user_b))`;
      await db`ALTER TABLE dm_threads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
      await db`CREATE INDEX IF NOT EXISTS dm_threads_user_a_idx ON dm_threads(user_a)`;
      await db`CREATE INDEX IF NOT EXISTS dm_threads_user_b_idx ON dm_threads(user_b)`;
      await db`CREATE TABLE IF NOT EXISTS dm_messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), thread_id UUID NOT NULL REFERENCES dm_threads(id) ON DELETE CASCADE, sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, body TEXT NOT NULL, moderation_status TEXT NOT NULL DEFAULT 'clear' CHECK (moderation_status IN ('clear','flagged','deleted')), moderation_reason TEXT, deleted_by UUID REFERENCES users(id) ON DELETE SET NULL, deleted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
      await db`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'clear'`;
      await db`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS moderation_reason TEXT`;
      await db`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL`;
      await db`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`;
      await db`CREATE INDEX IF NOT EXISTS dm_messages_thread_created_idx ON dm_messages(thread_id, created_at ASC)`;
      await db`CREATE INDEX IF NOT EXISTS dm_messages_moderation_idx ON dm_messages(moderation_status, created_at DESC)`;
      await db`CREATE INDEX IF NOT EXISTS dm_messages_sender_idx ON dm_messages(sender_id, created_at DESC)`;
    })().catch((error) => { schemaReady = null; throw error; });
  }
  return schemaReady;
}
