import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../auth";
import { ensureSchema, getDb } from "../../../../db";

const ADMIN_USERNAME = "kynetic";

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Not authenticated.", { status: 401 });
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return new NextResponse("Missing clip id.", { status: 400 });
    const db = getDb();
    const rows = await db`SELECT id, user_id, blob_path, content_type, status FROM clips WHERE id = ${id} AND status = 'approved' LIMIT 1`;
    const clip = rows[0];
    const admin = String(user.username).toLowerCase() === ADMIN_USERNAME;
    if (!clip || (String(clip.user_id) !== String(user.id) && !admin)) return new NextResponse("Not found.", { status: 404 });
    const result = await get(String(clip.blob_path), { access: "private", ifNoneMatch: request.headers.get("if-none-match") ?? undefined });
    if (!result) return new NextResponse("Not found.", { status: 404 });
    if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, "Cache-Control": "private, no-cache" } });
    return new NextResponse(result.stream, { status: 200, headers: {
      "Content-Type": result.blob.contentType || String(clip.content_type),
      "Content-Length": String(result.blob.size),
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      ETag: result.blob.etag,
      "Cache-Control": "private, no-cache",
    }});
  } catch (error) {
    console.error("Private clip delivery failed", error);
    return new NextResponse("Unable to load clip.", { status: 500 });
  }
}
