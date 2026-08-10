import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../auth";
import { ensureSchema, getDb } from "../../../db";

const SCORE_KEYS = [
  "decisionMaking",
  "mapAwareness",
  "teamIQ",
  "objectiveIQ",
  "gunfightIQ",
  "adaptability",
] as const;

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

function validateAttempt(attempt: any) {
  const overall = Number(attempt?.overall);
  const recruitScore = Number(attempt?.recruitScore);
  const archetype = typeof attempt?.archetype === "string" ? attempt.archetype.trim().slice(0, 100) : "";
  const scores = attempt?.scores;

  if (
    !Number.isInteger(overall) || overall < 0 || overall > 100 ||
    !Number.isInteger(recruitScore) || recruitScore < 0 || recruitScore > 100 ||
    !archetype || !scores || typeof scores !== "object" || Array.isArray(scores)
  ) {
    return null;
  }

  const normalizedScores: Record<string, number> = {};
  for (const key of SCORE_KEYS) {
    const value = Number(scores[key]);
    if (!Number.isInteger(value) || value < 0 || value > 100) return null;
    normalizedScores[key] = value;
  }

  const date = new Date(attempt?.date || Date.now());
  if (Number.isNaN(date.getTime())) return null;

  return {
    date: date.toISOString(),
    overall,
    recruitScore,
    archetype,
    scores: normalizedScores,
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
      FROM attempts WHERE user_id = ${user.id} ORDER BY date ASC
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

    // Validate the complete payload before touching the user's stored history.
    const validatedAttempts = attempts.map(validateAttempt);
    if (validatedAttempts.some((attempt) => attempt === null)) {
      return NextResponse.json({ error: "Invalid assessment data." }, { status: 400 });
    }

    const db = getDb();

    // The authenticated session is the only source of user_id. A client cannot
    // choose another user's account when saving or replacing assessment history.
    await db`DELETE FROM attempts WHERE user_id = ${user.id}`;

    for (const attempt of validatedAttempts) {
      if (!attempt) continue;
      await db`
        INSERT INTO attempts (user_id, date, overall, recruit_score, archetype, scores)
        VALUES (
          ${user.id},
          ${attempt.date},
          ${attempt.overall},
          ${attempt.recruitScore},
          ${attempt.archetype},
          ${JSON.stringify(attempt.scores)}::jsonb
        )
      `;
    }

    const saved = await db`
      SELECT date, overall, recruit_score, archetype, scores
      FROM attempts WHERE user_id = ${user.id} ORDER BY date ASC
    `;
    return NextResponse.json({ profile: buildProfile(user, saved) });
  } catch (error) {
    console.error("Profile save failed", error);
    return NextResponse.json({ error: "Unable to save your profile." }, { status: 500 });
  }
}
