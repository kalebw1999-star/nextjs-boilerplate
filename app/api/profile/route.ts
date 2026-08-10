import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../auth";
import { ensureSchema, getDb } from "../../../db";

function buildProfile(user: any, attempts: any[]) {
  return {
    name: user.username,
    createdAt: user.created_at,
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
}

export async function GET() {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const db = getDb();
    const attempts = await db`
      SELECT date, overall, recruit_score, archetype, scores
      FROM attempts
      WHERE user_id = ${user.id}
      ORDER BY date ASC
    `;

    return NextResponse.json({ profile: buildProfile(user, attempts) });
  } catch (error) {
    console.error("Profile load failed", error);
    return NextResponse.json({ error: "Unable to load your profile." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const body = await request.json();
    const attempts = Array.isArray(body.attempts) ? body.attempts : [];
    if (attempts.length > 1000) {
      return NextResponse.json({ error: "Too many assessment records." }, { status: 400 });
    }

    const db = getDb();
    await db`DELETE FROM attempts WHERE user_id = ${user.id}`;

    for (const attempt of attempts) {
      const overall = Number(attempt.overall);
      const recruitScore = Number(attempt.recruitScore);
      const archetype = typeof attempt.archetype === "string" ? attempt.archetype.slice(0, 100) : "";
      const scores = attempt.scores;

      if (
        !Number.isInteger(overall) || overall < 0 || overall > 100 ||
        !Number.isInteger(recruitScore) || recruitScore < 0 || recruitScore > 100 ||
        !archetype || !scores || typeof scores !== "object"
      ) {
        return NextResponse.json({ error: "Invalid assessment data." }, { status: 400 });
      }

      await db`
        INSERT INTO attempts (user_id, date, overall, recruit_score, archetype, scores)
        VALUES (
          ${user.id},
          ${new Date(attempt.date || Date.now()).toISOString()},
          ${overall},
          ${recruitScore},
          ${archetype},
          ${JSON.stringify(scores)}::jsonb
        )
      `;
    }

    const saved = await db`
      SELECT date, overall, recruit_score, archetype, scores
      FROM attempts
      WHERE user_id = ${user.id}
      ORDER BY date ASC
    `;

    return NextResponse.json({ profile: buildProfile(user, saved) });
  } catch (error) {
    console.error("Profile save failed", error);
    return NextResponse.json({ error: "Unable to save your profile." }, { status: 500 });
  }
}
