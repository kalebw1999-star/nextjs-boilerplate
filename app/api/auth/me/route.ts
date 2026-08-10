import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../auth";
import { getDb } from "../../../../db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null, profile: null });
    }

    const db = getDb();
    const attempts = await db`
      SELECT date, overall, recruit_score, archetype, scores
      FROM attempts
      WHERE user_id = ${user.id}
      ORDER BY date ASC
    `;

    const profile = {
      name: user.username,
      createdAt: user.created_at,
      attempts: attempts.map((attempt) => ({
        date: attempt.date,
        overall: attempt.overall,
        recruitScore: attempt.recruit_score,
        archetype: attempt.archetype,
        scores: attempt.scores,
      })),
      bestOverall: attempts.reduce(
        (best, attempt) => Math.max(best, Number(attempt.overall)),
        0
      ),
      bestRecruitScore: attempts.reduce(
        (best, attempt) => Math.max(best, Number(attempt.recruit_score)),
        0
      ),
    };

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Session lookup failed", error);
    return NextResponse.json(
      { error: "Unable to load your account." },
      { status: 500 }
    );
  }
}
