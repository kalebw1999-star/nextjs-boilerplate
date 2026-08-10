import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../auth";
import { ensureSchema, getDb } from "../../../db";

const ADMIN_USERNAME = "kynetic";

export async function GET() {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user || String(user.username).toLowerCase() !== ADMIN_USERNAME) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const db = getDb();
    const players = await db`
      SELECT
        u.id,
        u.username,
        u.created_at,
        COUNT(a.id)::int AS attempts,
        MAX(a.overall)::int AS best_overall,
        MAX(a.recruit_score)::int AS best_recruit,
        MAX(a.date) AS latest_date,
        (ARRAY_AGG(a.archetype ORDER BY a.date DESC))[1] AS latest_archetype
      FROM users u
      LEFT JOIN attempts a ON a.user_id = u.id
      GROUP BY u.id, u.username, u.created_at
      ORDER BY latest_date DESC NULLS LAST, u.created_at DESC
      LIMIT 500
    `;

    return NextResponse.json({
      players: players.map((player) => ({
        id: player.id,
        username: player.username,
        createdAt: player.created_at,
        attempts: Number(player.attempts ?? 0),
        bestOverall: player.best_overall == null ? null : Number(player.best_overall),
        bestRecruit: player.best_recruit == null ? null : Number(player.best_recruit),
        latestDate: player.latest_date,
        latestArchetype: player.latest_archetype ?? null,
      })),
    });
  } catch (error) {
    console.error("Recruitment load failed", error);
    return NextResponse.json({ error: "Unable to load recruitment data." }, { status: 500 });
  }
}
