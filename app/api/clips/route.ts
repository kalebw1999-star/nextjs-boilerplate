import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../auth";
import { ensureSchema, getDb } from "../../../db";

const ADMIN_USERNAME = "kynetic";
const MAX_DESCRIPTION = 1200;
const MAX_SECONDS = 120;

function isAdmin(user: any) { return String(user?.username ?? "").toLowerCase() === ADMIN_USERNAME; }

export async function GET() {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const db = getDb();
    const rows = isAdmin(user)
      ? await db`SELECT c.id, c.user_id, u.username, c.blob_path, c.content_type, c.size_bytes, c.duration_seconds, c.description, c.status, c.security_status, c.security_note, c.ai_status, c.ai_questions, c.player_answers, c.admin_review, c.admin_reviewed_at, c.created_at FROM clips c JOIN users u ON u.id = c.user_id WHERE c.status <> 'deleted' ORDER BY c.created_at DESC`
      : await db`SELECT id, user_id, blob_path, content_type, size_bytes, duration_seconds, description, status, security_status, security_note, ai_status, ai_questions, player_answers, admin_review, admin_reviewed_at, created_at FROM clips WHERE user_id = ${user.id} AND status <> 'deleted' ORDER BY created_at DESC`;
    return NextResponse.json({ clips: rows });
  } catch (error) {
    console.error("Clip list failed", error);
    return NextResponse.json({ error: "Unable to load clips." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const body = await request.json();
    const action = body?.action;
    const clipId = typeof body?.clipId === "string" ? body.clipId : "";
    const db = getDb();

    if (action === "answer") {
      const answers = body?.answers;
      if (!clipId || !Array.isArray(answers) || answers.length > 12 || answers.some((answer) => typeof answer !== "string" || answer.length > 2500)) return NextResponse.json({ error: "Invalid answers." }, { status: 400 });
      const result = await db`UPDATE clips SET player_answers = ${JSON.stringify(answers)}::jsonb, updated_at = NOW() WHERE id = ${clipId} AND user_id = ${user.id} AND status = 'approved' RETURNING id`;
      if (!result.length) return NextResponse.json({ error: "Clip not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    if (action === "admin_review") {
      if (!isAdmin(user)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
      const review = typeof body?.review === "string" ? body.review.trim() : "";
      if (review.length > 5000) return NextResponse.json({ error: "Review is too long." }, { status: 400 });
      const result = await db`UPDATE clips SET admin_review = ${review}, admin_reviewed_at = NOW(), updated_at = NOW() WHERE id = ${clipId} AND status <> 'deleted' RETURNING id`;
      if (!result.length) return NextResponse.json({ error: "Clip not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    if (action === "approve") {
      if (!isAdmin(user)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
      const result = await db`UPDATE clips SET status = 'approved', security_status = 'passed', security_note = 'Approved by admin after quarantine review.', updated_at = NOW() WHERE id = ${clipId} AND status <> 'deleted' RETURNING id`;
      if (!result.length) return NextResponse.json({ error: "Clip not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const result = await db`SELECT id, user_id, blob_path FROM clips WHERE id = ${clipId} AND status <> 'deleted' LIMIT 1`;
      const clip = result[0];
      if (!clip || (String(clip.user_id) !== String(user.id) && !isAdmin(user))) return NextResponse.json({ error: "Clip not found." }, { status: 404 });
      try { await del(String(clip.blob_path)); } catch (error) { console.error("Blob deletion failed", error); }
      await db`UPDATE clips SET status = 'deleted', security_status = 'failed', updated_at = NOW() WHERE id = ${clipId}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "regenerate_questions") {
      if (!clipId) return NextResponse.json({ error: "Missing clip." }, { status: 400 });
      const result = await db`SELECT id, description, player_answers, status, ai_questions FROM clips WHERE id = ${clipId} AND user_id = ${user.id} AND status = 'approved' LIMIT 1`;
      if (!result.length) return NextResponse.json({ error: "Clip not found." }, { status: 404 });
      return NextResponse.json({ ok: true, questions: result[0].ai_questions ?? [] });
    }

    if (typeof body?.description === "string") {
      const description = body.description.trim();
      if (!description || description.length > MAX_DESCRIPTION) return NextResponse.json({ error: "Description must be between one and 1200 characters." }, { status: 400 });
      if (!Number.isFinite(Number(body.durationSeconds)) || Number(body.durationSeconds) <= 0 || Number(body.durationSeconds) > MAX_SECONDS) return NextResponse.json({ error: "Clip must be two minutes or shorter." }, { status: 400 });
    }

    return NextResponse.json({ error: "Unsupported clip action." }, { status: 400 });
  } catch (error) {
    console.error("Clip action failed", error);
    return NextResponse.json({ error: "Unable to update clip." }, { status: 500 });
  }
}
