import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../auth";
import { ensureSchema, getDb } from "../../../../db";

export const runtime = "nodejs";
const MAX_QUESTIONS = 5;

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const body = await request.json();
    const clipId = String(body?.clipId ?? "").trim();
    if (!clipId) return NextResponse.json({ error: "Clip ID required." }, { status: 400 });
    const db = getDb();
    const rows = await db`SELECT id, description, duration_seconds, content_type, status FROM clips WHERE id=${clipId} AND user_id=${user.id} AND status='approved' LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: "Clip not found or not approved yet." }, { status: 404 });
    const clip = rows[0];
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return NextResponse.json({ error: "OpenAI is not configured on the server yet." }, { status: 503 });
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.CLIPIQ_MODEL?.trim() || "gpt-5-mini",
      input: `You are an esports recruiting analyst. Generate ${MAX_QUESTIONS} concise, high-value follow-up questions about a Call of Duty gameplay clip. The player already described what they did. Questions must probe decision-making, information usage, positioning, timing, teamwork, risk/reward, and what they would change. Do not grade the player and do not state whether an answer is correct. Return ONLY a JSON array of strings.\n\nPlayer explanation: ${String(clip.description)}\nClip duration: ${Number(clip.duration_seconds)} seconds\nContent type: ${String(clip.content_type)}`,
    });
    const raw = response.output_text?.trim() || "[]";
    let parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("AI returned an invalid question list.");
    const questions = parsed.filter((q): q is string => typeof q === "string").map(q => q.trim()).filter(Boolean).slice(0, MAX_QUESTIONS);
    if (!questions.length) throw new Error("AI returned no questions.");
    await db`UPDATE clips SET ai_status='ready', ai_questions=${JSON.stringify(questions)}::jsonb, updated_at=NOW() WHERE id=${clipId} AND user_id=${user.id}`;
    return NextResponse.json({ ok: true, questions });
  } catch (error) {
    console.error("ClipIQ question generation failed", error);
    try {
      const body = await request.clone().json();
      if (body?.clipId) { const db = getDb(); await db`UPDATE clips SET ai_status='failed', updated_at=NOW() WHERE id=${String(body.clipId)} AND user_id=(SELECT id FROM users WHERE username=${(await getCurrentUser())?.username ?? ""})`; }
    } catch {}
    return NextResponse.json({ error: "ClipIQ could not generate questions right now. The clip is still safe and available for review." }, { status: 500 });
  }
}
