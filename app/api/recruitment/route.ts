import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../auth";
import { ensureSchema, getDb } from "../../../db";

const ADMIN_USERNAME = "kynetic";
const VALID_ACTIONS = ["reset_cooldown", "add_waiting", "add_team", "remove_waiting", "remove_team", "team_to_waiting", "team_to_none"];

async function requireAdmin() {
  await ensureSchema();
  const user = await getCurrentUser();
  if (!user || String(user.username).toLowerCase() !== ADMIN_USERNAME) return null;
  return user;
}

export async function GET(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const db = getDb();
    const url = new URL(request.url);
    const playerId = url.searchParams.get("playerId");

    if (playerId) {
      const rows = await db`
        SELECT u.id, u.username, u.created_at, rs.status,
          rs.updated_at AS status_updated_at, ac.cooldown_reset_at, ac.team_lock_until,
          COUNT(a.id)::int AS attempts, MAX(a.overall)::int AS best_overall,
          MAX(a.recruit_score)::int AS best_recruit, MAX(a.date) AS latest_date,
          (ARRAY_AGG(a.archetype ORDER BY a.date DESC))[1] AS latest_archetype
        FROM users u
        LEFT JOIN recruitment_status rs ON rs.user_id = u.id
        LEFT JOIN assessment_controls ac ON ac.user_id = u.id
        LEFT JOIN attempts a ON a.user_id = u.id
        WHERE u.id = ${playerId}
        GROUP BY u.id, u.username, u.created_at, rs.status, rs.updated_at, ac.cooldown_reset_at, ac.team_lock_until
      `;
      if (!rows.length) return NextResponse.json({ error: "Player not found." }, { status: 404 });
      const attempts = await db`SELECT id, date, overall, recruit_score, archetype, scores, review FROM attempts WHERE user_id = ${playerId} ORDER BY date DESC LIMIT 20`;
      const p = rows[0];
      return NextResponse.json({ player: {
        id: p.id, username: p.username, createdAt: p.created_at, status: p.status ?? "none",
        statusUpdatedAt: p.status_updated_at ?? null, cooldownResetAt: p.cooldown_reset_at ?? null,
        teamLockUntil: p.team_lock_until ?? null, attempts: Number(p.attempts ?? 0),
        bestOverall: p.best_overall == null ? null : Number(p.best_overall),
        bestRecruit: p.best_recruit == null ? null : Number(p.best_recruit), latestDate: p.latest_date ?? null,
        latestArchetype: p.latest_archetype ?? null, history: attempts,
      }});
    }

    const players = await db`
      SELECT u.id, u.username, u.created_at, COALESCE(rs.status, 'none') AS status,
        COUNT(a.id)::int AS attempts, MAX(a.overall)::int AS best_overall,
        MAX(a.recruit_score)::int AS best_recruit, MAX(a.date) AS latest_date,
        (ARRAY_AGG(a.archetype ORDER BY a.date DESC))[1] AS latest_archetype
      FROM users u LEFT JOIN recruitment_status rs ON rs.user_id = u.id LEFT JOIN attempts a ON a.user_id = u.id
      GROUP BY u.id, u.username, u.created_at, rs.status
      ORDER BY latest_date DESC NULLS LAST, u.created_at DESC LIMIT 500
    `;
    return NextResponse.json({ players: players.map((p) => ({
      id: p.id, username: p.username, createdAt: p.created_at, status: p.status,
      attempts: Number(p.attempts ?? 0), bestOverall: p.best_overall == null ? null : Number(p.best_overall),
      bestRecruit: p.best_recruit == null ? null : Number(p.best_recruit), latestDate: p.latest_date ?? null,
      latestArchetype: p.latest_archetype ?? null,
    })) });
  } catch (error) {
    console.error("Recruitment load failed", error);
    return NextResponse.json({ error: "Unable to load recruitment data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const body = await request.json();
    const playerId = String(body.playerId ?? "");
    const action = String(body.action ?? "");
    if (!playerId || !VALID_ACTIONS.includes(action)) return NextResponse.json({ error: "Invalid recruitment action." }, { status: 400 });

    const db = getDb();
    if (action === "reset_cooldown") {
      await db`INSERT INTO assessment_controls (user_id, cooldown_reset_at, team_lock_until) VALUES (${playerId}, NOW(), NULL)
        ON CONFLICT (user_id) DO UPDATE SET cooldown_reset_at = NOW(), team_lock_until = NULL`;
    } else {
      const status = action === "add_waiting" || action === "team_to_waiting" ? "waiting" : action === "add_team" ? "team" : "none";
      await db`INSERT INTO recruitment_status (user_id, status, updated_at) VALUES (${playerId}, ${status}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET status = ${status}, updated_at = NOW()`;
      // A roster change never deletes attempts or stats. Cooldown rules are derived from the new status.
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Recruitment action failed", error);
    return NextResponse.json({ error: "Unable to update player." }, { status: 500 });
  }
}
