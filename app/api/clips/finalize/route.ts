import { head } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../auth";
import { ensureSchema, getDb } from "../../../../db";

const MAX_BYTES = 500 * 1024 * 1024;
const MAX_SECONDS = 120;
const MAX_DESCRIPTION = 1200;

function validDescription(value: unknown) {
  return typeof value === "string" && value.trim().length >= 1 && value.trim().length <= MAX_DESCRIPTION;
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const body = await request.json();
    const blobPath = typeof body?.blobPath === "string" ? body.blobPath : "";
    const blobUrl = typeof body?.blobUrl === "string" ? body.blobUrl : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const durationSeconds = Number(body?.durationSeconds);

    if (!blobPath.startsWith("clips/") || !blobUrl || !validDescription(description)) return NextResponse.json({ error: "Invalid clip record data." }, { status: 400 });
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > MAX_SECONDS) return NextResponse.json({ error: "Clip must be two minutes or shorter." }, { status: 400 });

    const metadata = await head(blobPath);
    if (!metadata) return NextResponse.json({ error: "Uploaded video could not be verified in Blob storage." }, { status: 400 });
    if (Number(metadata.size) > MAX_BYTES) return NextResponse.json({ error: "Uploaded video is larger than 500 MB." }, { status: 400 });
    if (!String(metadata.contentType ?? "").startsWith("video/")) return NextResponse.json({ error: "Uploaded file is not a video." }, { status: 400 });

    const db = getDb();
    const recent = await db`SELECT COUNT(*)::int AS count FROM clips WHERE user_id = ${user.id} AND created_at >= NOW() - INTERVAL '24 hours' AND status <> 'deleted'`;
    const existing = await db`SELECT id FROM clips WHERE blob_path = ${blobPath} LIMIT 1`;
    if (!existing.length && Number(recent[0]?.count ?? 0) >= 3) return NextResponse.json({ error: "You can upload up to three clips every 24 hours." }, { status: 400 });

    const result = await db`INSERT INTO clips (user_id, blob_path, blob_url, content_type, size_bytes, duration_seconds, description, status, security_status, ai_status) VALUES (${user.id}, ${blobPath}, ${blobUrl}, ${metadata.contentType}, ${metadata.size}, ${durationSeconds}, ${description}, 'quarantine', 'pending', 'pending') ON CONFLICT (blob_path) DO UPDATE SET description = EXCLUDED.description, duration_seconds = EXCLUDED.duration_seconds, updated_at = NOW() WHERE clips.user_id = ${user.id} RETURNING id`;

    if (!result.length) return NextResponse.json({ error: "This clip belongs to another account." }, { status: 403 });
    return NextResponse.json({ ok: true, clipId: result[0].id });
  } catch (error) {
    console.error("Clip finalization failed", error);
    return NextResponse.json({ error: "The video uploaded, but its recruiting record could not be saved. Please refresh and try again." }, { status: 500 });
  }
}
