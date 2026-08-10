"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Player = { id: string; username: string; createdAt: string; attempts: number; bestOverall: number | null; bestRecruit: number | null; latestDate: string | null; latestArchetype: string | null };

export default function AdminPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPlayers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/recruitment", { cache: "no-store" }); const data = await r.json();
      if (r.status === 401 || r.status === 403) { router.replace("/dashboard"); return; }
      if (!r.ok) throw new Error(data.error ?? "Unable to load admin data.");
      setPlayers(data.players ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load admin data."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void loadPlayers(); }, [loadPlayers]);
  const filtered = useMemo(() => players.filter((p) => p.username.toLowerCase().includes(query.trim().toLowerCase())), [players, query]);
  const tested = players.filter((p) => p.attempts > 0).length;
  const topRecruit = Math.max(0, ...players.map((p) => p.bestRecruit ?? 0));

  return <main className="min-h-screen bg-black text-white px-5 py-8 sm:px-8"><div className="max-w-6xl mx-auto">
    <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8"><div><p className="text-xs font-black tracking-[0.3em] text-red-500">CALL OF DUTY ESPORTS REPORTER</p><h1 className="text-4xl font-black mt-2">ADMIN CENTER</h1><p className="text-zinc-500 mt-2">Review your recruiting pool and assessment activity.</p></div><div className="flex gap-3"><button onClick={() => void loadPlayers()} disabled={loading} className="rounded-xl border border-zinc-800 px-5 py-3 font-bold disabled:opacity-50">{loading ? "REFRESHING..." : "REFRESH"}</button><Link href="/dashboard" className="rounded-xl border border-zinc-800 px-5 py-3 font-bold">DASHBOARD</Link></div></header>
    <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6"><Metric label="Players" value={players.length} /><Metric label="Tested" value={tested} /><Metric label="Attempts" value={players.reduce((n, p) => n + p.attempts, 0)} /><Metric label="Top Overall" value={Math.max(0, ...players.map((p) => p.bestOverall ?? 0))} /><Metric label="Top Recruit" value={topRecruit} /></section>
    <section className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden"><div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row gap-3"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search players..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500" /><span className="self-center text-xs font-bold text-zinc-600">{filtered.length} MATCHES</span></div>{error ? <p className="p-6 text-red-400">{error}</p> : <div className="divide-y divide-zinc-800">{filtered.map(p => <div key={p.id} className="p-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 hover:bg-zinc-900/40"><div className="min-w-0"><p className="font-black text-lg truncate">{p.username}</p><p className="text-sm text-zinc-600">Joined {new Date(p.createdAt).toLocaleDateString()}{p.latestDate ? ` · Last test ${new Date(p.latestDate).toLocaleDateString()}` : " · No test yet"}</p></div><div className="grid grid-cols-3 sm:flex gap-6 text-sm"><span><b>{p.attempts}</b><small className="block text-zinc-600">TESTS</small></span><span><b>{p.bestOverall ?? "—"}</b><small className="block text-zinc-600">BEST OVERALL</small></span><span><b className="text-red-400">{p.bestRecruit ?? "—"}</b><small className="block text-zinc-600">BEST RECRUIT</small></span><span><b>{p.latestArchetype ?? "Untested"}</b><small className="block text-zinc-600">LATEST TYPE</small></span></div></div>)}{!filtered.length && <p className="p-8 text-center text-zinc-500">No players found.</p>}</div>}</section>
  </div></main>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"><p className="text-xs font-bold tracking-wider text-zinc-600">{label.toUpperCase()}</p><p className="text-3xl font-black mt-2">{value}</p></div>; }
