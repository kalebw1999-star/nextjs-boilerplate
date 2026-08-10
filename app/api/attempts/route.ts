import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../auth";
import { getDb } from "../../../db";

const SCORE_KEYS = [
  "decisionMaking",
  "mapAwareness",
  "teamIQ",
  "objectiveIQ",
  "gunfightIQ",
  "adaptability",
] as const;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const overall = Number(body.overall);
    const recruitScore = Number(body.recruitScore);
    const archetype = String(body.archetype ?? "").trim();
    const scores = body.scores;

    const validScores =
      scores &&
      typeof scores === "object" &&
      SCORE_KEYS.every(
        (key) => Number.isInteger(Number(scores[key])) && Number(scores[key]) >= 0 && Number(scores[key]) <= 100
      );

    if (
      !Number.isInteger(overall) || overall < 0 || overall > 100 ||
      !Number.isInteger(recruitScore) || recruitScore < 0 || recruitScore > 100 ||
      !archetype || !validScores
    ) {
      return NextResponse.json(
        { error: "Invalid assessment data." },
        { status: 400 }
      );
    }

    const db = getDb();
    await db`
      INSERT INTO attempts (
        user_id,
        overall,
        recruit_score,
        archetype,
        scores
      )
      VALUES (
        ${user.id},
        ${overall},
        ${recruitScore},
        ${archetype},
        ${JSON.stringify(scores)}::jsonb
      )
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Attempt save failed", error);
    return NextResponse.json(
      { error: "Unable to save this assessment." },
      { status: 500 }
    );
  }
}
