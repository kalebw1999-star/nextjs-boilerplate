import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../auth";
import { ensureSchema, getDb } from "../../../../db";

const ADMIN_USERNAME = "kynetic";
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const isAdmin = String(user.username).toLowerCase() === ADMIN_USERNAME;
    if (isAdmin) return NextResponse.json({ error: "Admin accounts do not use the review lock." }, { status: 410 });

    const db = getDb();
    const rows = await db`
      SELECT id, date, review FROM attempts
      WHERE user_id = ${user.id}
      ORDER BY date DESC
      LIMIT 1
    `;

    const attempt = rows[0];
    if (!attempt?.review) return NextResponse.json({ error: "No review is available yet." }, { status: 404 });

    const expiresAt = new Date(new Date(attempt.date).getTime() + COOLDOWN_MS);
    if (Date.now() >= expiresAt.getTime()) return NextResponse.json({ error: "The review period has ended." }, { status: 410 });

    return NextResponse.json({ available: true, expiresAt: expiresAt.toISOString(), attemptDate: new Date(attempt.date).toISOString(), review: attempt.review });
  } catch (error) {
    console.error("Assessment review failed", error);
    return NextResponse.json({ error: "Unable to load assessment review." }, { status: 500 });
  }
}
