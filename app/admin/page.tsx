"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Player = { id: string; username: string; createdAt: string; status: "none" | "waiting" | "team"; attempts: number; bestOverall: number | null; bestRecruit: number | null; latestDate: string | null; latestArchetype: string | null };
type Detail = Player & { statusUpdatedAt: string | null; cooldownResetAt: string | null; history: { id: string; date: string; overall: number; recruit_score: number; archetype: string }[] };
type Tab = "recruitment" | "waiting" | "team";

export default function AdminPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("recruitment");
  const [selected, setSelected] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPlayers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/recruitment", { cache: "no-store" });
      const data = await r.json();
      if (r.status === 401 || r.status === 403) { router.replace("/dashboard"); return; }
      if (!r.ok) throw new Error(data.error ?? "Unable to load recruitment data.");
      setPlayers(data.players ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load recruitment data."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void loadPlayers(); }, [loadPlayers]);

  async function openPlayer(id: string) {
    try {
      const r = await fetch(`/api/recruitment?playerId=${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Unable to load player.");
      setSelected(data.player);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load player."); }
  }

  async function action(playerId: string, actionName: "reset_cooldown" | "add_waiting" | "add_team" | "remove_team") {
    setActionLoading(true); setError("");
    try {
      const r = await fetch("/api/recruitment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerId, action: actionName }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Unable to update player.");
      await loadPlayers();
      await openPlayer(playerId);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update player."); }
    finally { setActionLoading(false); }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter(p => !q || p.username.toLowerCase().includes(q));
  }, [players, query]);
  const waiting = players.filter(p => p.status === "waiting");
  const team = players.filter(p => p.status === "team");

  return <main className="min-h-screen bg-black text-white px-5 py-8 sm:px-8"><div className="max-w-6xl mx-auto">
    <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8"><div><p className="text-xs font-black tracking-[0.3em] text-red-500">CALL OF DUTY ESPORTS REPORTER</p><h1 className="text-4xl font-black mt-2">RECRUITMENT</h1><p className="text-zinc-500 mt-2">Manage players, prospects, and your team.</p></div><div className="flex gap-3"><button onClick={() => void loadPlayers()} disabled={loading} className="rounded-xl border border-zinc-800 px-5 py-3 font-bold disabled:opacity-50">{loading ? "REFRESHING..." : "REFRESH"}</button><Link href="/dashboard" className="rounded-xl border border-zinc-800 px-5 py-3 font-bold">DASHBOARD</Link></div></header>
    <nav className="flex gap-2 overflow-x-auto border-b border-zinc-800 mb-6"><TabButton active={tab === "recruitment"} onClick={() => setTab("recruitment")}>RECRUITMENT</TabButton><TabButton active={tab === "waiting"} onClick={() => setTab("waiting")}>WAITING ROOM <Badge>{waiting.length}</Badge></TabButton><TabButton active={tab === "team"} onClick={() => setTab("team")}>TEAM <Badge>{team.length}</Badge></TabButton></nav>
    {error && <p className="mb-5 text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl px-4 py-3">{error}</p>}

    {tab === "recruitment" && <section className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden"><div className="p-5 border-b border-zinc-800 flex gap-3"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search players..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500" /><span className="self-center text-xs font-bold text-zinc-600">{filtered.length} MATCHES</span></div><div className="divide-y divide-zinc-800">{filtered.map(p => <button key={p.id} onClick={() => void openPlayer(p.id)} className="w-full text-left p-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 hover:bg-zinc-900/60 transition"><div><p className="font-black text-lg">{p.username}</p><p className="text-sm text-zinc-600">{p.latestDate ? `Last test ${new Date(p.latestDate).toLocaleDateString()}` : "No test yet"} · {p.status === "none" ? "Available" : p.status === "waiting" ? "Potential teammate" : "Team member"}</p></div><div className="flex gap-6 text-sm"><Stat value={p.attempts} label="TESTS" /><Stat value={p.bestOverall ?? "—"} label="BEST OVERALL" /><Stat value={p.bestRecruit ?? "—"} label="BEST RECRUIT" red /><Stat value={p.latestArchetype ?? "Untested"} label="TYPE" /></div></button>)}{!filtered.length && <p className="p-8 text-center text-zinc-500">No players found.</p>}</div></section>}
    {tab === "waiting" && <PlayerCollection title="WAITING ROOM" description="Players you have marked as potential teammates." players={waiting} empty="No potential teammates yet." onOpen={openPlayer} actionLabel="MOVE TO TEAM" onAction={id => void action(id, "add_team")} />}
    {tab === "team" && <PlayerCollection title="TEAM NAME HERE" description="Your current team roster. The team name can be changed later." players={team} empty="No players are on the team yet." onOpen={openPlayer} actionLabel="REMOVE FROM TEAM" onAction={id => void action(id, "remove_team")} />}
  </div>

  {selected && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><div className="max-w-3xl mx-auto mt-8 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"><div className="p-6 border-b border-zinc-800 flex items-start justify-between"><div><p className="text-xs font-black tracking-[0.2em] text-red-500">PLAYER PROFILE</p><h2 className="text-3xl font-black mt-2">{selected.username}</h2><p className="text-zinc-600 text-sm mt-1">Joined {new Date(selected.createdAt).toLocaleDateString()}</p></div><button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-2xl">×</button></div><div className="p-6 space-y-6"><div className="grid grid-cols-2 sm:grid-cols-4 gap-3"><Metric label="Tests" value={selected.attempts} /><Metric label="Best Overall" value={selected.bestOverall ?? 0} /><Metric label="Best Recruit" value={selected.bestRecruit ?? 0} /><div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-[10px] font-bold text-zinc-600">STATUS</p><p className="font-black mt-2 capitalize">{selected.status}</p></div></div><div className="flex flex-wrap gap-3"><button disabled={actionLoading} onClick={() => void action(selected.id, "reset_cooldown")} className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-3 font-bold disabled:opacity-50">RESET TIMER</button>{selected.status === "none" && <button disabled={actionLoading} onClick={() => void action(selected.id, "add_waiting")} className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-3 font-bold disabled:opacity-50">ADD AS POTENTIAL TEAMMATE</button>}{selected.status === "waiting" && <button disabled={actionLoading} onClick={() => void action(selected.id, "add_team")} className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-3 font-bold disabled:opacity-50">ADD TO TEAM</button>}</div><div><h3 className="font-black text-lg mb-3">TEST HISTORY</h3>{selected.history.length ? <div className="space-y-2">{selected.history.map(a => <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between gap-3"><div><p className="font-bold">{a.archetype}</p><p className="text-xs text-zinc-600">{new Date(a.date).toLocaleString()}</p></div><div className="text-right"><p className="font-black">{a.overall} overall</p><p className="text-xs text-red-400">{a.recruit_score} recruit</p></div></div>)}</div> : <p className="text-zinc-600">No completed tests yet.</p>}</div></div></div></div>}
  </main>;
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className={`shrink-0 px-4 py-3 text-sm font-black tracking-wider border-b-2 ${active ? "border-red-500 text-white" : "border-transparent text-zinc-600 hover:text-zinc-300"}`}>{children}</button>; }
function Badge({ children }: { children: React.ReactNode }) { return <span className="ml-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px]">{children}</span>; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-[10px] font-bold tracking-wider text-zinc-600">{label.toUpperCase()}</p><p className="text-2xl font-black mt-2">{value}</p></div>; }
function Stat({ value, label, red }: { value: React.ReactNode; label: string; red?: boolean }) { return <span><b className={red ? "text-red-400" : ""}>{value}</b><small className="block text-zinc-600">{label}</small></span>; }
function PlayerCollection({ title, description, players, empty, onOpen, actionLabel, onAction }: { title: string; description: string; players: Player[]; empty: string; onOpen: (id: string) => void; actionLabel: string; onAction: (id: string) => void }) { return <section className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden"><div className="p-6 border-b border-zinc-800"><p className="text-xs font-black tracking-[0.2em] text-red-500">ADMIN ONLY</p><h2 className="text-2xl font-black mt-2">{title}</h2><p className="text-zinc-500 mt-2">{description}</p></div>{players.length ? <div className="divide-y divide-zinc-800">{players.map(p => <div key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><button onClick={() => onOpen(p.id)} className="text-left"><p className="font-black text-lg hover:text-red-400">{p.username}</p><p className="text-sm text-zinc-600">{p.latestArchetype ?? "Untested"} · Best recruit {p.bestRecruit ?? "—"}</p></button><button onClick={() => onAction(p.id)} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold hover:bg-zinc-900">{actionLabel}</button></div>)}</div> : <p className="p-10 text-center text-zinc-600">{empty}</p>}</section>; }
