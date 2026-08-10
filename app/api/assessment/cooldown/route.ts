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
    if (isAdmin) {
      return NextResponse.json({ locked: false, isAdmin: true, canRetakeAt: null });
    }

    const db = getDb();
    const rows = await db`
      SELECT date
      FROM attempts
      WHERE user_id = ${user.id}
      ORDER BY date DESC
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ locked: false, isAdmin: false, canRetakeAt: null });
    }

    const lastAttempt = new Date(rows[0].date).getTime();
    const canRetakeAt = new Date(lastAttempt + COOLDOWN_MS);
    const locked = Date.now() < canRetakeAt.getTime();

    return NextResponse.json({
      locked,
      isAdmin: false,
      canRetakeAt: locked ? canRetakeAt.toISOString() : null,
    });
  } catch (error) {
    console.error("Assessment cooldown check failed", error);
    return NextResponse.json({ error: "Unable to check assessment availability." }, { status: 500 });
  }
}
