import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../auth";
import { ensureSchema, getDb } from "../../../db";

const ADMIN_USERNAME = "kynetic";
const DAY_MS = 24 * 60 * 60 * 1000;
const NORMAL_COOLDOWN_MS = 3 * DAY_MS;
const SCORE_KEYS = ["decisionMaking", "mapAwareness", "teamIQ", "objectiveIQ", "gunfightIQ", "adaptability"] as const;

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

    const db = getDb();
    const statusRows = await db`
      SELECT COALESCE(rs.status, 'none') AS status, rs.updated_at AS status_updated_at,
        ac.cooldown_reset_at, ac.team_lock_until,
        (SELECT date FROM attempts WHERE user_id = ${user.id} ORDER BY date DESC LIMIT 1) AS last_attempt
      FROM users u
      LEFT JOIN recruitment_status rs ON rs.user_id = u.id
      LEFT JOIN assessment_controls ac ON ac.user_id = u.id
      WHERE u.id = ${user.id}
    `;
    const current = statusRows[0];
    const isAdmin = String(user.username).toLowerCase() === ADMIN_USERNAME;
    const status = String(current?.status ?? "none");
    const lastAttempt = current?.last_attempt ? new Date(current.last_attempt).getTime() : 0;
    const resetAt = current?.cooldown_reset_at ? new Date(current.cooldown_reset_at).getTime() : 0;
    const now = Date.now();

    if (!isAdmin && resetAt < lastAttempt) {
      if (status === "team" && current?.team_lock_until) {
        const lockUntil = new Date(current.team_lock_until).getTime();
        if (now < lockUntil) return NextResponse.json({ error: "Your team assessment lock is still active." }, { status: 429 });
      }
      if (status !== "team" && lastAttempt) {
        const cooldown = status === "waiting" ? DAY_MS : NORMAL_COOLDOWN_MS;
        if (now < lastAttempt + cooldown) return NextResponse.json({ error: "Your assessment is still on cooldown." }, { status: 429 });
      }
    }

    if (!isAdmin && status === "team") {
      const teamSince = current?.status_updated_at ? new Date(current.status_updated_at) : new Date(0);
      const recent = await db`SELECT COUNT(*)::int AS count FROM attempts WHERE user_id = ${user.id} AND date >= ${teamSince}`;
      if (Number(recent[0]?.count ?? 0) >= 3) {
        const lockUntil = new Date(now + DAY_MS);
        await db`INSERT INTO assessment_controls (user_id, team_lock_until) VALUES (${user.id}, ${lockUntil})
          ON CONFLICT (user_id) DO UPDATE SET team_lock_until = ${lockUntil}`;
        return NextResponse.json({ error: "You have used your three team assessments. Your one-day team lock has started." }, { status: 429 });
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
    if (status === "team") {
      const teamSince = current?.status_updated_at ? new Date(current.status_updated_at) : new Date(0);
      const recent = await db`SELECT COUNT(*)::int AS count FROM attempts WHERE user_id = ${user.id} AND date >= ${teamSince}`;
      if (Number(recent[0]?.count ?? 0) >= 3) {
        const lockUntil = new Date(Date.now() + DAY_MS);
        await db`INSERT INTO assessment_controls (user_id, team_lock_until) VALUES (${user.id}, ${lockUntil})
          ON CONFLICT (user_id) DO UPDATE SET team_lock_until = ${lockUntil}`;
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Attempt save failed", error);
    return NextResponse.json({ error: "Unable to save this assessment." }, { status: 500 });
  }
}
