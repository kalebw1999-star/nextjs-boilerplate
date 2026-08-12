import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../auth";
import { ensureSchema, getDb } from "../../../db";

const ADMIN_USERNAME = "kynetic";

type Person = { id: string; username: string; status: "none" | "waiting" | "team"; teamId: string | null; isRecruiter: boolean };
function isAdmin(username: string) { return username.toLowerCase() === ADMIN_USERNAME; }
function pairAllowed(sender: Person, target: Person) {
  if (sender.status === "waiting") return target.status === "waiting";
  if (sender.status === "team") return (target.status === "team" && target.teamId === sender.teamId) || (target.isRecruiter && target.teamId === sender.teamId);
  return true;
}
async function person(db: ReturnType<typeof getDb>, id: string): Promise<Person | null> {
  const rows = await db`SELECT u.id,u.username,COALESCE(rs.status,'none') status,rs.team_id,EXISTS(SELECT 1 FROM team_memberships tm WHERE tm.user_id=u.id AND tm.role='recruiter') is_recruiter FROM users u LEFT JOIN recruitment_status rs ON rs.user_id=u.id WHERE u.id=${id}`;
  if (!rows.length) return null;
  return { id:String(rows[0].id), username:String(rows[0].username), status:rows[0].status, teamId:rows[0].team_id ?? null, isRecruiter:Boolean(rows[0].is_recruiter) || isAdmin(String(rows[0].username)) };
}

export async function GET() {
  try {
    await ensureSchema(); const user=await getCurrentUser(); if(!user) return NextResponse.json({error:"Not authenticated."},{status:401}); const db=getDb(); const me=await person(db,user.id); if(!me) return NextResponse.json({error:"Profile not found."},{status:404});
    const incoming=await db`SELECT v.id,v.caller_id,u.username caller_username,v.status,v.requires_approval,v.created_at,v.expires_at FROM voice_invites v JOIN users u ON u.id=v.caller_id WHERE v.recipient_id=${me.id} AND v.status='pending' AND v.expires_at>NOW() ORDER BY v.created_at DESC`;
    const outgoing=await db`SELECT v.id,v.recipient_id,u.username recipient_username,v.status,v.requires_approval,v.created_at,v.expires_at FROM voice_invites v JOIN users u ON u.id=v.recipient_id WHERE v.caller_id=${me.id} AND v.status='pending' AND v.expires_at>NOW() ORDER BY v.created_at DESC`;
    return NextResponse.json({incoming,outgoing});
  } catch { return NextResponse.json({error:"Unable to load voice invites."},{status:500}); }
}

export async function POST(request:Request) {
  try {
    await ensureSchema(); const user=await getCurrentUser(); if(!user) return NextResponse.json({error:"Not authenticated."},{status:401}); const db=getDb(); const me=await person(db,user.id); if(!me) return NextResponse.json({error:"Profile not found."},{status:404});
    const body=await request.json(); const recipientId=String(body.recipientId??""); if(!recipientId || recipientId===me.id) return NextResponse.json({error:"Choose another player."},{status:400}); const target=await person(db,recipientId); if(!target) return NextResponse.json({error:"Player not found."},{status:404}); if(!pairAllowed(me,target)) return NextResponse.json({error:"You cannot invite this player from your current status."},{status:403});
    const existing=await db`SELECT id FROM voice_invites WHERE caller_id=${me.id} AND recipient_id=${target.id} AND status='pending' AND expires_at>NOW() LIMIT 1`; if(existing.length) return NextResponse.json({error:"A voice invite is already pending."},{status:409});
    const requiresApproval=target.isRecruiter && !me.isRecruiter;
    const rows=await db`INSERT INTO voice_invites(caller_id,recipient_id,requires_approval) VALUES(${me.id},${target.id},${requiresApproval}) RETURNING id,status,requires_approval,created_at,expires_at`;
    return NextResponse.json({ok:true,invite:rows[0],message:requiresApproval?"Voice request sent. The recruiter must approve it before joining.":"Voice invite sent. They can join whenever they want."});
  } catch { return NextResponse.json({error:"Unable to send voice invite."},{status:500}); }
}

export async function PATCH(request:Request) {
  try {
    await ensureSchema(); const user=await getCurrentUser(); if(!user) return NextResponse.json({error:"Not authenticated."},{status:401}); const db=getDb(); const me=await person(db,user.id); if(!me) return NextResponse.json({error:"Profile not found."},{status:404});
    const body=await request.json(); const inviteId=String(body.inviteId??""); const action=String(body.action??""); if(!inviteId || !["accept","decline","cancel"].includes(action)) return NextResponse.json({error:"Invalid voice invite action."},{status:400});
    const rows=await db`SELECT id,caller_id,recipient_id,status,requires_approval FROM voice_invites WHERE id=${inviteId} AND status='pending' AND expires_at>NOW() LIMIT 1`; if(!rows.length) return NextResponse.json({error:"Voice invite not found or expired."},{status:404}); const invite=rows[0];
    if(action==="cancel") { if(String(invite.caller_id)!==me.id) return NextResponse.json({error:"Only the caller can cancel this invite."},{status:403}); await db`UPDATE voice_invites SET status='cancelled',responded_at=NOW() WHERE id=${inviteId}`; return NextResponse.json({ok:true,status:"cancelled"}); }
    if(String(invite.recipient_id)!==me.id) return NextResponse.json({error:"Only the recipient can respond."},{status:403});
    const next=action==="accept"?"accepted":"declined"; await db`UPDATE voice_invites SET status=${next},responded_at=NOW() WHERE id=${inviteId}`; return NextResponse.json({ok:true,status:next});
  } catch { return NextResponse.json({error:"Unable to update voice invite."},{status:500}); }
}
