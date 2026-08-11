"use client";

import { useEffect, useState } from "react";

 type Clip = { id: string; username: string; duration_seconds: number; size_bytes: number; description: string; status: string; security_status: string; ai_status: string; ai_questions?: string[]; player_answers?: string[]; admin_review?: string | null; created_at: string };

export default function AdminClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [review, setReview] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setError("");
    try { const r = await fetch("/api/clips", { cache: "no-store" }); const data = await r.json(); if (!r.ok) throw new Error(data.error ?? "Unable to load clips."); setClips(data.clips ?? []); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load clips."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function action(clipId: string, actionName: string) {
    const body: any = { action: actionName, clipId };
    if (actionName === "admin_review") body.review = review[clipId] ?? "";
    const r = await fetch("/api/clips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json(); if (!r.ok) setError(data.error ?? "Unable to update clip."); else await load();
  }

  return <main className="min-h-screen bg-black text-white px-4 py-8 md:px-8"><div className="max-w-6xl mx-auto"><header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"><div><p className="text-xs font-black tracking-[0.25em] text-red-500">ADMIN ONLY</p><h1 className="text-5xl font-black mt-2">CLIP REVIEW</h1><p className="text-zinc-500 mt-2">Security quarantine, gameplay review, AI questions, and player responses.</p></div><button onClick={() => void load()} className="rounded-xl border border-zinc-800 px-5 py-3 font-bold">{loading ? "REFRESHING..." : "REFRESH"}</button></header>{error && <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-red-300">{error}</div>}<div className="space-y-6">{clips.map(clip => <article key={clip.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden"><div className="aspect-video bg-black"><video controls preload="metadata" className="w-full h-full" src={clip.status === "approved" ? `/api/clips/file?id=${encodeURIComponent(clip.id)}` : undefined} /></div><div className="p-6"><div className="flex flex-wrap gap-2"><span className="bg-zinc-900 rounded-full px-3 py-1 text-xs font-black">{clip.username}</span><span className="bg-zinc-900 rounded-full px-3 py-1 text-xs font-black">{clip.status}</span><span className="bg-zinc-900 rounded-full px-3 py-1 text-xs font-black">SECURITY {clip.security_status}</span><span className="bg-zinc-900 rounded-full px-3 py-1 text-xs font-black">AI {clip.ai_status}</span></div><p className="mt-5 text-zinc-300 leading-relaxed">{clip.description}</p>{clip.ai_questions?.length ? <div className="mt-6"><p className="text-xs font-black tracking-wider text-red-500">AI QUESTIONS</p><div className="space-y-4 mt-3">{clip.ai_questions.map((q, i) => <div key={q}><p className="font-bold text-sm">{i + 1}. {q}</p><p className="text-sm text-zinc-500 mt-1">Player answer: {clip.player_answers?.[i] || "Not answered yet."}</p></div>)}</div></div> : null}<div className="mt-6"><p className="text-xs font-black tracking-wider text-zinc-500">YOUR REVIEW</p><textarea value={review[clip.id] ?? clip.admin_review ?? ""} onChange={(e) => setReview(prev => ({ ...prev, [clip.id]: e.target.value }))} rows={5} placeholder="Explain what the player did well, what could be improved, and why." className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-red-500 resize-none" /><div className="flex flex-wrap gap-3 mt-4"><button onClick={() => void action(clip.id, "admin_review")} className="bg-white text-black px-5 py-3 rounded-xl font-black">SAVE REVIEW</button>{clip.status === "quarantine" && <button onClick={() => void action(clip.id, "approve")} className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-black">CLEAR & APPROVE</button>}<button onClick={() => void action(clip.id, "delete")} className="border border-red-900 text-red-400 px-5 py-3 rounded-xl font-black">DELETE CLIP</button></div></div></div></article>)}{!clips.length && <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center text-zinc-600">No clips have been submitted.</div>}</div></div></main>;
}
