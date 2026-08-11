import { head } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../auth";
import { ensureSchema, getDb } from "../../../../db";

const MAX_BYTES = 500 * 1024 * 1024;
const MAX_SECONDS = 120;
const DAILY_LIMIT = 3;

function isSafeDescription(value: unknown) { return typeof value === "string" && value.trim().length >= 1 && value.trim().length <= 1200; }

export async function POST(request: Request): Promise<NextResponse> {
  await ensureSchema();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload: { description: string; durationSeconds: number };
        try { payload = JSON.parse(clientPayload ?? "{}"); } catch { throw new Error("Invalid upload metadata."); }
        if (!isSafeDescription(payload.description)) throw new Error("Add a brief explanation of what you did in the clip.");
        if (!Number.isFinite(payload.durationSeconds) || payload.durationSeconds <= 0 || payload.durationSeconds > MAX_SECONDS) throw new Error("Clips must be two minutes or shorter.");
        const db = getDb();
        const recent = await db`SELECT COUNT(*)::int AS count FROM clips WHERE user_id = ${user.id} AND created_at >= NOW() - INTERVAL '24 hours' AND status <> 'deleted'`;
        if (Number(recent[0]?.count ?? 0) >= DAILY_LIMIT) throw new Error("You can upload up to three clips every 24 hours.");
        return { allowedContentTypes: ["video/*"], maximumSizeInBytes: MAX_BYTES, addRandomSuffix: true, tokenPayload: JSON.stringify({ userId: user.id, description: payload.description.trim(), durationSeconds: payload.durationSeconds, originalPathname: pathname }) };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = JSON.parse(tokenPayload ?? "{}");
        if (payload.userId !== user.id) throw new Error("Upload ownership check failed.");
        if (!isSafeDescription(payload.description) || payload.durationSeconds > MAX_SECONDS) throw new Error("Upload metadata failed validation.");
        const metadata = await head(blob.pathname);
        if (!metadata || Number(metadata.size) > MAX_BYTES) throw new Error("Uploaded file failed the size check.");
        const db = getDb();
        try {
          await db`INSERT INTO clips (user_id, blob_path, blob_url, content_type, size_bytes, duration_seconds, description, status, security_status, ai_status) VALUES (${user.id}, ${blob.pathname}, ${blob.url}, ${metadata.contentType ?? blob.contentType ?? "video/unknown"}, ${metadata.size}, ${payload.durationSeconds}, ${payload.description.trim()}, 'quarantine', 'pending', 'pending') ON CONFLICT (blob_path) DO NOTHING`;
        } catch (databaseError) {
          // The browser finalizes the record immediately after upload as a second, authenticated path.
          // Keep the Blob intact here so that a transient webhook/database failure can be recovered.
          console.error("Clip database record creation failed in Blob completion callback", databaseError);
        }
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Clip upload token/completion failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to prepare the upload." }, { status: 400 });
  }
}
