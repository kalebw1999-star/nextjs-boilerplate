import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "../../../../auth";
import { ensureSchema, getDb } from "../../../../db";

function normalizeUsername(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const username = normalizeUsername(body.username);
    const password = typeof body.password === "string" ? body.password : "";

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3–24 characters and use only letters, numbers, or underscores." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: "Password must be between 8 and 128 characters." },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = await db`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
    if (existing.length) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const rows = await db`
      INSERT INTO users (username, password_hash)
      VALUES (${username}, ${passwordHash})
      RETURNING id, username
    `;

    await createSession(rows[0].id as string);
    return NextResponse.json({ username: rows[0].username });
  } catch (error) {
    console.error("Signup error", error);
    return NextResponse.json({ error: "Unable to create the account right now." }, { status: 500 });
  }
}
