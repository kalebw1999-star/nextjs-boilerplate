import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../auth";
import { ensureSchema, getDb } from "../../../db";

const SCORE_KEYS = ["decisionMaking", "mapAwareness", "teamIQ", "objectiveIQ", "gunfightIQ", "adaptability"] as const;
const ADMIN_USERNAME = "kynetic";
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

type ValidatedAttempt = { date: string; overall: number; recruitScore: number; archetype: string; scores: Record<string, number>; review: unknown | null };

function buildProfile(user: any, attempts: any[]) {
  const isAdmin = String(user.username).toLowerCase() === ADMIN_USERNAME;
  const latestIndex = attempts.length - 1;
  return {
    name: user.username,
    createdAt: user.created_at,
    isAdmin,
    attempts: attempts.map((attempt, index) => {
      const expiresAt = new Date(new Date(attempt.date).getTime() + COOLDOWN_MS);
      const reviewAvailable = index === latestIndex && !isAdmin && Date.now() < expiresAt.getTime() && attempt.review;
      return {
        date: attempt.date,
        overall: Number(attempt.overall),
        recruitScore: Number(attempt.recruit_score),
        archetype: attempt.archetype,
        scores: attempt.scores,
        ...(reviewAvailable ? { review: attempt.review } : {}),
      };
    }),
    bestOverall: attempts.reduce((best, attempt) => Math.max(best, Number(attempt.overall)), 0),
    bestRecruitScore: attempts.reduce((best, attempt) => Math.max(best, Number(attempt.recruit_score)), 0),
  };
}

function validateAttempt(attempt: any): ValidatedAttempt | null {
  const overall = Number(attempt?.overall);
  const recruitScore = Number(attempt?.recruitScore);
  const archetype = typeof attempt?.archetype === "string" ? attempt.archetype.trim().slice(0, 100) : "";
  const scores = attempt?.scores;
  const review = attempt?.review ?? null;
  if (!Number.isInteger(overall) || overall < 0 || overall > 100 || !Number.isInteger(recruitScore) || recruitScore < 0 || recruitScore > 100 || !archetype || !scores || typeof scores !== "object" || Array.isArray(scores)) return null;
  if (review !== null && (typeof review !== "object" || JSON.stringify(review).length > 250000)) return null;
  const normalizedScores: Record<string, number> = {};
  for (const key of SCORE_KEYS) {
    const value = Number(scores[key]);
    if (!Number.isInteger(value) || value < 0 || value > 100) return null;
    normalizedScores[key] = value;
  }
  const date = new Date(attempt?.date || Date.now());
  if (Number.isNaN(date.getTime())) return null;
  return { date: date.toISOString(), overall, recruitScore, archetype, scores: normalizedScores, review };
}

export async function GET() {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const db = getDb();
    const attempts = await db`SELECT date, overall, recruit_score, archetype, scores, review FROM attempts WHERE user_id = ${user.id} ORDER BY date ASC`;
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
    if (attempts.length > 1000) return NextResponse.json({ error: "Too many assessment records." }, { status: 400 });
    const validatedAttempts: (ValidatedAttempt | null)[] = attempts.map(validateAttempt);
    if (validatedAttempts.some((attempt: ValidatedAttempt | null) => attempt === null)) return NextResponse.json({ error: "Invalid assessment data." }, { status: 400 });

    const db = getDb();
    const existing = await db`SELECT date FROM attempts WHERE user_id = ${user.id} ORDER BY date DESC LIMIT 1`;
    const isAdmin = String(user.username).toLowerCase() === ADMIN_USERNAME;
    const existingLatest = existing[0]?.date ? new Date(existing[0].date).getTime() : null;
    const incomingLatest = validatedAttempts.length ? Math.max(...validatedAttempts.filter((attempt): attempt is ValidatedAttempt => Boolean(attempt)).map((attempt) => new Date(attempt.date).getTime())) : null;
    if (!isAdmin && existingLatest !== null && Date.now() < existingLatest + COOLDOWN_MS && incomingLatest !== null && incomingLatest > existingLatest) {
      return NextResponse.json({ error: "Your assessment is locked for three days after completion." }, { status: 429 });
    }

    await db`DELETE FROM attempts WHERE user_id = ${user.id}`;
    for (const attempt of validatedAttempts) {
      if (!attempt) continue;
      await db`INSERT INTO attempts (user_id, date, overall, recruit_score, archetype, scores, review) VALUES (${user.id}, ${attempt.date}, ${attempt.overall}, ${attempt.recruitScore}, ${attempt.archetype}, ${JSON.stringify(attempt.scores)}::jsonb, ${attempt.review ? JSON.stringify(attempt.review) : null}::jsonb)`;
    }
    const saved = await db`SELECT date, overall, recruit_score, archetype, scores, review FROM attempts WHERE user_id = ${user.id} ORDER BY date ASC`;
    return NextResponse.json({ profile: buildProfile(user, saved) });
  } catch (error) {
    console.error("Profile save failed", error);
    return NextResponse.json({ error: "Unable to save your profile." }, { status: 500 });
  }
}
