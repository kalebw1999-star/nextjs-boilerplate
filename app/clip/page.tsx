"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";

const MAX_SECONDS = 120;
const MAX_BYTES = 500 * 1024 * 1024;

type Clip = { id: string; username?: string; duration_seconds: number; size_bytes: number; description: string; status: string; security_status: string; ai_status: string; ai_questions?: string[]; player_answers?: string[]; admin_review?: string | null; created_at: string };

function formatBytes(bytes: number) { return `${(bytes / 1024 / 1024).toFixed(1)} MB`; }

export default function ClipIQPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  async function load() {
    setError("");
    try {
      const r = await fetch("/api/clips", { cache: "no-store" });
      const data = await r.json();
      if (r.ok) setClips(data.clips ?? []); else setError(data.error ?? "Unable to load clips.");
    } catch { setError("Unable to load clips. Check your connection and try again."); }
  }
  useEffect(() => { void load(); }, []);

  function choose(next: File | null) {
    setError(""); setMessage(""); setFile(null); setDuration(0);
    if (!next) return;
    if (!next.type.startsWith("video/")) { setError("Please choose a video file."); return; }
    if (next.size > MAX_BYTES) { setError("That video is larger than 500 MB."); return; }
    const url = URL.createObjectURL(next);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => { URL.revokeObjectURL(url); const seconds = video.duration; if (!Number.isFinite(seconds) || seconds <= 0 || seconds > MAX_SECONDS) { setError("Clips must be two minutes or shorter."); return; } setDuration(seconds); setFile(next); };
    video.onerror = () => { URL.revokeObjectURL(url); setError("This file could not be read as a video."); };
    video.src = url;
  }

  async function submit() {
    setError(""); setMessage("");
    if (!file || !duration) { setError("Choose a video first."); return; }
    if (!description.trim()) { setError("Add a brief explanation of what you did during the clip."); return; }
    if (description.trim().length > 1200) { setError("Keep the explanation under 1200 characters."); return; }
    setBusy(true); setProgress(0);
    try {
      const blob = await upload(`clips/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`, file, {
        access: "private",
        multipart: true,
        handleUploadUrl: "/api/clips/upload",
        clientPayload: JSON.stringify({ description: description.trim(), durationSeconds: duration }),
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      const finalize = await fetch("/api/clips/finalize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blobPath: blob.pathname, blobUrl: blob.url, description: description.trim(), durationSeconds: duration }) });
      const finalizeData = await finalize.json();
      if (!finalize.ok) throw new Error(finalizeData.error ?? "The video uploaded, but its recruiting record could not be saved.");
      setMessage("Upload received and placed into security quarantine. An admin must clear it before it enters recruiting review.");
      setFile(null); setDuration(0); setDescription(""); if (inputRef.current) inputRef.current.value = "";
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setBusy(false); }
  }

  async function deleteClip(id: string) {
    if (!confirm("Delete this clip? This removes the clip only and does not affect your stats.")) return;
    const r = await fetch("/api/clips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", clipId: id }) });
    const data = await r.json(); if (!r.ok) setError(data.error ?? "Unable to delete clip."); else await load();
  }

  async function submitAnswers(clip: Clip) {
    const list = answers[clip.id] ?? [];
    const r = await fetch("/api/clips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "answer", clipId: clip.id, answers: list }) });
    const data = await r.json(); if (!r.ok) setError(data.error ?? "Unable to save answers."); else setMessage("Your answers were submitted for recruiter review.");
  }

  return <main className="min-h-screen bg-[#050505] text-white px-4 py-8 md:px-8"><div className="max-w-5xl mx-auto">
    <header className="mb-8"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black tracking-[0.25em] text-red-500">CLIP IQ</p><h1 className="text-5xl md:text-6xl font-black mt-2">GAMEPLAY REVIEW</h1></div><a href="/dashboard" className="shrink-0 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-black hover:bg-zinc-900">← BACK TO DASHBOARD</a></div><p className="text-zinc-500 mt-3 max-w-2xl">Submit up to three gameplay clips every 24 hours. Recruiters are the only other users who can view them.</p></header>
    {error && <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-red-300">{error}</div>}
    {message && <div className="mb-5 rounded-2xl border border-green-500/30 bg-green-500/5 p-5 text-green-300">{message}</div>}
    <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 mb-8"><div className="border border-dashed border-zinc-700 rounded-2xl p-8 text-center"><input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => choose(e.target.files?.[0] ?? null)} /><button onClick={() => inputRef.current?.click()} className="bg-white text-black px-6 py-3 rounded-xl font-black">CHOOSE VIDEO</button><p className="text-xs text-zinc-600 mt-4">Video formats accepted • maximum two minutes • maximum 500 MB</p>{file && <div className="mt-6 text-left max-w-xl mx-auto bg-zinc-900 rounded-xl p-4"><p className="font-bold truncate">{file.name}</p><p className="text-xs text-zinc-500 mt-1">{formatBytes(file.size)} · {duration.toFixed(1)} seconds</p></div>}</div><label className="block mt-6"><span className="text-xs font-black tracking-wider text-zinc-500">WHAT DID YOU DO IN THIS CLIP?</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1200} rows={5} placeholder="Briefly explain the situation, what you decided to do, and why." className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-red-500 resize-none" /></label><div className="flex items-center gap-4 mt-5"><button disabled={busy || !file} onClick={submit} className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 px-7 py-4 rounded-xl font-black">{busy ? `UPLOADING ${Math.round(progress)}%` : "SUBMIT CLIP"}</button>{busy && <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-red-600" style={{ width: `${progress}%` }} /></div>}</div></section>
    <section><div className="flex justify-between items-end mb-4"><div><p className="text-xs font-black tracking-[0.2em] text-zinc-600">YOUR SUBMISSIONS</p><h2 className="text-2xl font-black mt-1">CLIP HISTORY</h2></div><button onClick={() => void load()} className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-black text-zinc-500 hover:text-white hover:bg-zinc-900">REFRESH</button></div><div className="space-y-4">{clips.map(clip => <article key={clip.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden"><div className="aspect-video bg-black"><video controls preload="metadata" className="w-full h-full" src={clip.status === "approved" ? `/api/clips/file?id=${encodeURIComponent(clip.id)}` : undefined} /></div><div className="p-6"><div className="flex flex-wrap gap-2 mb-4"><span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold">{clip.status.toUpperCase()}</span><span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold">SECURITY: {clip.security_status.toUpperCase()}</span><span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold">AI: {clip.ai_status.toUpperCase()}</span></div><p className="text-zinc-300 leading-relaxed">{clip.description}</p>{clip.status === "approved" && clip.ai_questions?.length ? <div className="mt-6 space-y-4"><p className="text-xs font-black tracking-wider text-red-500">YOUR CLIP IQ QUESTIONS</p>{clip.ai_questions.map((question, index) => <div key={`${clip.id}-${index}`}><p className="font-bold text-sm">{index + 1}. {question}</p><textarea value={(answers[clip.id] ?? clip.player_answers ?? [])[index] ?? ""} onChange={(e) => setAnswers(prev => ({ ...prev, [clip.id]: Object.assign([...(prev[clip.id] ?? clip.player_answers ?? [])], { [index]: e.target.value }) }))} rows={3} className="w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 outline-none focus:border-red-500" placeholder="Type your answer..." /></div>)}<button onClick={() => void submitAnswers(clip)} className="bg-white text-black px-5 py-3 rounded-xl font-black">SUBMIT ANSWERS</button></div> : clip.status === "quarantine" ? <p className="mt-5 text-sm text-yellow-400">Your clip is isolated while it goes through the security/recruiter clearance process.</p> : null}{clip.admin_review && <div className="mt-6 border-t border-zinc-800 pt-5"><p className="text-xs font-black tracking-wider text-green-400">RECRUITER REVIEW</p><p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap">{clip.admin_review}</p></div>}<button onClick={() => void deleteClip(clip.id)} className="mt-6 text-xs font-bold text-zinc-600 hover:text-red-400">DELETE CLIP</button></div></article>)}{!clips.length && <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center text-zinc-600">No clips submitted yet.</div>}</div></section>
  </div></main>;
}
