import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../auth";
import { ensureSchema, getDb } from "../../../../db";

const MAX_QUESTIONS = 8;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: Request) {
  let clipId = "";
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const body = await request.json();
    clipId = typeof body?.clipId === "string" ? body.clipId : "";
    if (!clipId) return NextResponse.json({ error: "Missing clip." }, { status: 400 });
    const db = getDb();
    const rows = await db`SELECT id, description, duration_seconds, status FROM clips WHERE id = ${clipId} AND user_id = ${user.id} AND status = 'approved' LIMIT 1`;
    const clip = rows[0];
    if (!clip) return NextResponse.json({ error: "Clip not found." }, { status: 404 });

    await db`UPDATE clips SET ai_status = 'processing', updated_at = NOW() WHERE id = ${clipId}`;
    const client = getOpenAI();
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `You are a competitive Call of Duty esports coach helping a recruiter evaluate a gameplay clip. The player provided this explanation of their clip:\n\n${String(clip.description).slice(0, 1200)}\n\nThe clip duration is ${Number(clip.duration_seconds).toFixed(1)} seconds.\n\nCreate ${MAX_QUESTIONS} concise, open-ended follow-up questions that challenge the player's decision making, information usage, positioning, timing, risk/reward, teamwork, and what they could improve. Do not grade the player. Do not say whether an answer is right or wrong. Do not invent specific visual events that were not stated in the player's explanation. Return only a JSON array of strings.`,
    });
    let questions: string[] = [];
    try {
      const parsed = JSON.parse(response.output_text);
      if (Array.isArray(parsed)) questions = parsed.filter((item) => typeof item === "string").slice(0, MAX_QUESTIONS).map((item) => item.trim()).filter(Boolean);
    } catch {
      questions = response.output_text.split(/\n+/).map((item) => item.replace(/^\s*(?:[-*]|\d+[.)])\s*/, "").trim()).filter(Boolean).slice(0, MAX_QUESTIONS);
    }
    if (!questions.length) throw new Error("The AI did not return usable questions.");
    await db`UPDATE clips SET ai_status = 'ready', ai_questions = ${JSON.stringify(questions)}::jsonb, updated_at = NOW() WHERE id = ${clipId}`;
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Clip AI analysis failed", error);
    try { if (clipId) await getDb() `UPDATE clips SET ai_status = 'failed', updated_at = NOW() WHERE id = ${clipId}`; } catch {}
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate Clip IQ questions." }, { status: 500 });
  }
}
