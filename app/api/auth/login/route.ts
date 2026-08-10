import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureSchema, getDb } from "../../../../db";
import { createSession } from "../../../../auth";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const db = getDb();
    const rows = await db`
      SELECT id, username, password_hash, created_at
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, rows[0].password_hash as string);
    if (!valid) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    await createSession(rows[0].id as string);

    const attempts = await db`
      SELECT date, overall, recruit_score, archetype, scores
      FROM attempts
      WHERE user_id = ${rows[0].id}
      ORDER BY date ASC
    `;

    const profile = {
      name: rows[0].username,
      createdAt: rows[0].created_at,
      attempts: attempts.map((attempt) => ({
        date: attempt.date,
        overall: Number(attempt.overall),
        recruitScore: Number(attempt.recruit_score),
        archetype: attempt.archetype,
        scores: attempt.scores,
      })),
      bestOverall: attempts.reduce((best, attempt) => Math.max(best, Number(attempt.overall)), 0),
      bestRecruitScore: attempts.reduce((best, attempt) => Math.max(best, Number(attempt.recruit_score)), 0),
    };

    return NextResponse.json({
      user: {
        id: rows[0].id,
        username: rows[0].username,
        created_at: rows[0].created_at,
      },
      profile,
    });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
