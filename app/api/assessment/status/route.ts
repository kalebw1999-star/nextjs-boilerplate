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
    const db = getDb();
    const rows = await db`
      SELECT a.date, ac.cooldown_reset_at
      FROM (SELECT date FROM attempts WHERE user_id = ${user.id} ORDER BY date DESC LIMIT 1) a
      FULL OUTER JOIN assessment_controls ac ON ac.user_id = ${user.id}
      LIMIT 1
    `;

    const lastAttemptAt = rows[0]?.date ? new Date(rows[0].date).getTime() : null;
    const resetAt = rows[0]?.cooldown_reset_at ? new Date(rows[0].cooldown_reset_at).getTime() : 0;
    const reset = lastAttemptAt !== null && resetAt >= lastAttemptAt;
    const nextAssessmentAt = lastAttemptAt && !reset ? new Date(lastAttemptAt + COOLDOWN_MS).toISOString() : null;
    const locked = !isAdmin && nextAssessmentAt !== null && Date.now() < new Date(nextAssessmentAt).getTime();

    return NextResponse.json({
      isAdmin,
      canTakeAssessment: !locked,
      lastAttemptAt: lastAttemptAt ? new Date(lastAttemptAt).toISOString() : null,
      nextAssessmentAt: locked ? nextAssessmentAt : null,
      cooldownDays: 3,
    });
  } catch (error) {
    console.error("Assessment status failed", error);
    return NextResponse.json({ error: "Unable to check assessment status." }, { status: 500 });
  }
}
