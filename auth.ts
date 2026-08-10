import { cookies } from "next/headers";
import { ensureSchema, getDb } from "./db";

const COOKIE = "codiq_session";
const DAYS = 30;

export async function createSession(userId: string) {
  await ensureSchema();
  const db = getDb();
  const expires = new Date(Date.now() + DAYS * 86400000);
  const rows = await db`
    INSERT INTO sessions (user_id, expires_at)
    VALUES (${userId}, ${expires.toISOString()})
    RETURNING id
  `;
  const id = rows[0].id as string;
  const store = await cookies();
  store.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  await ensureSchema();
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (id) {
    const db = getDb();
    await db`DELETE FROM sessions WHERE id = ${id}`;
  }
  store.delete(COOKIE);
}

export async function getCurrentUser() {
  await ensureSchema();
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (!id) return null;

  const db = getDb();
  const rows = await db`
    SELECT u.id, u.username, u.created_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${id} AND s.expires_at > NOW()
    LIMIT 1
  `;
  return rows[0] ?? null;
}
