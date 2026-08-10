import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../auth";
import { ensureSchema, getDb } from "../../../../db";

export async function GET() {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const db = getDb();
    const rows = await db`SELECT draft, updated_at FROM assessment_drafts WHERE user_id = ${user.id} LIMIT 1`;
    if (!rows[0]) return NextResponse.json({ draft: null });
    return NextResponse.json({ draft: rows[0].draft, updatedAt: rows[0].updated_at });
  } catch (error) {
    console.error("Draft load failed", error);
    return NextResponse.json({ error: "Unable to load your saved test." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const body = await request.json();
    const draft = body?.draft;
    if (!draft || typeof draft !== "object" || JSON.stringify(draft).length > 500000) {
      return NextResponse.json({ error: "Invalid saved test." }, { status: 400 });
    }
    const db = getDb();
    await db`
      INSERT INTO assessment_drafts (user_id, updated_at, draft)
      VALUES (${user.id}, NOW(), ${JSON.stringify(draft)}::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW(), draft = EXCLUDED.draft
    `;
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Draft save failed", error);
    return NextResponse.json({ error: "Unable to save your test." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const db = getDb();
    await db`DELETE FROM assessment_drafts WHERE user_id = ${user.id}`;
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Draft delete failed", error);
    return NextResponse.json({ error: "Unable to clear your saved test." }, { status: 500 });
  }
}
