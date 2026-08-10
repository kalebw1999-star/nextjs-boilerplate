import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../auth";
import { ensureSchema, getDb } from "../../../db";

const ADMIN_USERNAME = "kynetic";
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
const SCORE_KEYS = ["decisionMaking", "mapAwareness", "teamIQ", "objectiveIQ", "gunfightIQ", "adaptability"] as const;

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

    const db = getDb();
    const controlRows = await db`
      SELECT a.date, ac.cooldown_reset_at
      FROM (SELECT date FROM attempts WHERE user_id = ${user.id} ORDER BY date DESC LIMIT 1) a
      FULL OUTER JOIN assessment_controls ac ON ac.user_id = ${user.id}
      LIMIT 1
    `;
    if (String(user.username).toLowerCase() !== ADMIN_USERNAME && controlRows[0]?.date) {
      const last = new Date(controlRows[0].date).getTime();
      const reset = controlRows[0]?.cooldown_reset_at ? new Date(controlRows[0].cooldown_reset_at).getTime() : 0;
      if (reset < last && Date.now() < last + COOLDOWN_MS) {
        return NextResponse.json({ error: "Your assessment is still on cooldown." }, { status: 429 });
      }
    }

    const body = await request.json();
    const overall = Number(body.overall);
    const recruitScore = Number(body.recruitScore);
    const archetype = String(body.archetype ?? "").trim();
    const scores = body.scores;
    const validScores = scores && typeof scores === "object" && SCORE_KEYS.every(key => Number.isInteger(Number(scores[key])) && Number(scores[key]) >= 0 && Number(scores[key]) <= 100);
    if (!Number.isInteger(overall) || overall < 0 || overall > 100 || !Number.isInteger(recruitScore) || recruitScore < 0 || recruitScore > 100 || !archetype || !validScores) {
      return NextResponse.json({ error: "Invalid assessment data." }, { status: 400 });
    }

    await db`INSERT INTO attempts (user_id, overall, recruit_score, archetype, scores) VALUES (${user.id}, ${overall}, ${recruitScore}, ${archetype}, ${JSON.stringify(scores)}::jsonb)`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Attempt save failed", error);
    return NextResponse.json({ error: "Unable to save this assessment." }, { status: 500 });
  }
}
