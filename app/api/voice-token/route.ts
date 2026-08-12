import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { getCurrentUser } from "../../../auth";
import { ensureSchema, getDb } from "../../../db";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const body = await request.json();
    const inviteId = String(body.inviteId ?? "");
    if (!inviteId) return NextResponse.json({ error: "Voice invite required." }, { status: 400 });
    const db = getDb();
    const rows = await db`SELECT id, caller_id, recipient_id, status, expires_at FROM voice_invites WHERE id = ${inviteId} AND expires_at > NOW() LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: "Voice invite not found or expired." }, { status: 404 });
    const invite = rows[0];
    if (String(invite.caller_id) !== user.id && String(invite.recipient_id) !== user.id) return NextResponse.json({ error: "You are not part of this voice invite." }, { status: 403 });
    if (invite.status !== "accepted") return NextResponse.json({ error: "This voice invite has not been accepted." }, { status: 409 });
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;
    if (!apiKey || !apiSecret || !livekitUrl) return NextResponse.json({ error: "LiveKit is not configured on the server yet." }, { status: 503 });
    const roomName = `voice-${invite.id}`;
    const token = new AccessToken(apiKey, apiSecret, { identity: user.id, name: user.username, ttl: "1h" });
    token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
    return NextResponse.json({ token: await token.toJwt(), url: livekitUrl, roomName });
  } catch (error) {
    console.error("Voice token failed", error);
    return NextResponse.json({ error: "Unable to start voice chat." }, { status: 500 });
  }
}
