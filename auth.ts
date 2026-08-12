import { cookies } from "next/headers";
import { compare, hash } from "bcryptjs";
import { ensureSchema, getDb, isAdminUsername } from "./db";

const COOKIE = "codiq_session";
const DAYS = 30;

export async function createUser(username: string, password: string) {
  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(normalized)) throw new Error("Username must be 3-24 characters using letters, numbers, or underscores.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  await ensureSchema();
  const db = getDb();
  const passwordHash = await hash(password, 12);
  try {
    const rows = await db`INSERT INTO users (username, password_hash, gamer_tag) VALUES (${normalized}, ${passwordHash}, '') RETURNING id, username, gamer_tag, created_at`;
    return rows[0];
  } catch (error) {
    if (String(error).toLowerCase().includes("unique")) throw new Error("That username is already taken.");
    throw error;
  }
}

export async function authenticateUser(username: string, password: string) {
  await ensureSchema();
  const db = getDb();
  const normalized = username.trim().toLowerCase();
  const rows = await db`SELECT id, username, password_hash, gamer_tag, created_at FROM users WHERE username = ${normalized} LIMIT 1`;
  const user = rows[0]; if (!user) return null;
  const valid = await compare(password, user.password_hash as string);
  return valid ? user : null;
}

export async function createSession(userId: string) {
  await ensureSchema(); const db = getDb(); const expires = new Date(Date.now() + DAYS * 86400000);
  const rows = await db`INSERT INTO sessions (user_id, expires_at) VALUES (${userId}, ${expires.toISOString()}) RETURNING id`;
  const id = rows[0].id as string; const store = await cookies();
  store.set(COOKIE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires });
}

export async function destroySession() {
  await ensureSchema(); const store = await cookies(); const id = store.get(COOKIE)?.value;
  if (id) { const db = getDb(); await db`DELETE FROM sessions WHERE id = ${id}`; }
  store.delete(COOKIE);
}

export async function getCurrentUser() {
  await ensureSchema(); const store = await cookies(); const id = store.get(COOKIE)?.value; if (!id) return null;
  const db = getDb();
  const rows = await db`SELECT u.id, u.username, u.gamer_tag, u.created_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ${id} AND s.expires_at > NOW() LIMIT 1`;
  const user = rows[0]; if (!user) return null;
  return { ...user, isAdmin: isAdminUsername(user.username) };
}
