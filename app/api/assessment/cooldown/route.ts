import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../auth";
import { ensureSchema, getDb } from "../../../../db";

const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    // Admin status is resolved by auth.ts, so don't access a username field
    // that isn't part of the getCurrentUser() return type.
    if (user.isAdmin) {
      return NextResponse.json({ locked: false, isAdmin: true, canRetakeAt: null });
    }

    const db = getDb();
    const rows = await db`
      SELECT
        (SELECT date FROM attempts WHERE user_id = ${user.id} ORDER BY date DESC LIMIT 1) AS date,
        (SELECT cooldown_reset_at FROM assessment_controls WHERE user_id = ${user.id} LIMIT 1) AS cooldown_reset_at
    `;

    const lastAttemptValue = rows[0]?.date;
    if (!lastAttemptValue) {
      return NextResponse.json({ locked: false, isAdmin: false, canRetakeAt: null });
    }

    const lastAttempt = new Date(lastAttemptValue).getTime();
    const resetAt = rows[0]?.cooldown_reset_at ? new Date(rows[0].cooldown_reset_at).getTime() : 0;
    if (resetAt >= lastAttempt) {
      return NextResponse.json({ locked: false, isAdmin: false, canRetakeAt: null, reset: true });
    }

    const canRetakeAt = new Date(lastAttempt + COOLDOWN_MS);
    const locked = Date.now() < canRetakeAt.getTime();
    return NextResponse.json({ locked, isAdmin: false, canRetakeAt: locked ? canRetakeAt.toISOString() : null });
  } catch (error) {
    console.error("Assessment cooldown check failed", error);
    return NextResponse.json({ error: "Unable to check assessment availability." }, { status: 500 });
  }
}
