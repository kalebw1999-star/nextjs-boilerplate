import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "../../../../db";
import { createSession } from "../../../../auth";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!USERNAME_RE.test(username)) {
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
    const existing = await db`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const rows = await db`
      INSERT INTO users (username, password_hash)
      VALUES (${username}, ${passwordHash})
      RETURNING id, username, created_at
    `;

    await createSession(rows[0].id as string);

    return NextResponse.json({
      user: rows[0],
      profile: {
        name: rows[0].username,
        createdAt: rows[0].created_at,
        attempts: [],
        bestOverall: 0,
        bestRecruitScore: 0,
      },
    });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json(
      { error: "Unable to create your account right now." },
      { status: 500 }
    );
  }
}
