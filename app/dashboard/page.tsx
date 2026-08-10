"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Scores = { decisionMaking: number; mapAwareness: number; teamIQ: number; objectiveIQ: number; gunfightIQ: number; adaptability: number };
type Attempt = { date: string; overall: number; recruitScore: number; archetype: string; scores: Scores };
type Profile = { name: string; createdAt: string; isAdmin: boolean; attempts: Attempt[]; bestOverall: number; bestRecruitScore: number };

const labels: Record<keyof Scores, string> = { decisionMaking: "Decision Making", mapAwareness: "Map Awareness", teamIQ: "Team IQ", objectiveIQ: "Objective IQ", gunfightIQ: "Gunfight IQ", adaptability: "Adaptability" };

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 401) { router.replace("/login"); return; }
        if (!response.ok) throw new Error(data.error ?? "Unable to load your profile.");
        setProfile(data.profile);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <main className="min-h-screen bg-black text-white flex items-center justify-center">Loading profile...</main>;
  if (error) return <main className="min-h-screen bg-black text-white flex items-center justify-center px-6"><div className="text-center"><p className="text-red-400">{error}</p><Link href="/" className="text-red-500 mt-4 inline-block">Back to recruiter</Link></div></main>;
  if (!profile) return null;

  const latest = profile.attempts[profile.attempts.length - 1];

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-black text-white px-5 py-8 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div><p className="text-xs font-black tracking-[0.3em] text-red-500">CALL OF DUTY ESPORTS RECRUITER</p><h1 className="text-4xl font-black mt-2">PLAYER DASHBOARD</h1><p className="text-zinc-500 mt-2">Welcome back, <span className="text-white font-bold">{profile.name}</span>{profile.isAdmin ? <span className="ml-2 text-red-500 font-black">ADMIN</span> : null}.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/" className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-3 font-black">TAKE TEST</Link>{profile.isAdmin ? <Link href="/recruitment" className="rounded-xl border border-red-900 bg-red-950/40 px-5 py-3 font-black text-red-400 hover:bg-red-950">RECRUITMENT</Link> : null}<button onClick={signOut} className="rounded-xl border border-zinc-800 px-5 py-3 font-bold text-zinc-300 hover:bg-zinc-900">SIGN OUT</button></div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat title="Tests Taken" value={profile.attempts.length} /><Stat title="Best Score" value={profile.bestOverall} suffix="/100" /><Stat title="Best Recruit" value={profile.bestRecruitScore} suffix="/100" /><Stat title="Latest Score" value={latest?.overall ?? "—"} suffix={latest ? "/100" : ""} />
        </section>

        {latest ? <>
          <section className="mt-8 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.2em] text-zinc-500">LATEST ASSESSMENT</p><h2 className="text-3xl font-black mt-2">{latest.archetype}</h2><p className="text-zinc-500 mt-2">{new Date(latest.date).toLocaleString()}</p></div><div className="text-left sm:text-right"><p className="text-5xl font-black text-red-500">{latest.overall}</p><p className="text-xs text-zinc-500 font-bold">OVERALL SCORE</p></div></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">{(Object.keys(labels) as (keyof Scores)[]).map((key) => <div key={key} className="bg-zinc-900 rounded-2xl p-4"><div className="flex justify-between gap-3 text-sm"><span className="text-zinc-400">{labels[key]}</span><span className="font-black">{latest.scores[key]}</span></div><div className="h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden"><div className="h-full bg-red-600 rounded-full" style={{ width: `${latest.scores[key]}%` }} /></div></div>)}</div>
          </section>
          <section className="mt-8"><p className="text-xs font-bold tracking-[0.2em] text-zinc-500">HISTORY</p><h2 className="text-2xl font-black mt-1 mb-4">Assessment History</h2><div className="space-y-3">{[...profile.attempts].reverse().map((attempt, index) => <div key={`${attempt.date}-${index}`} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><p className="font-black">{attempt.archetype}</p><p className="text-sm text-zinc-600 mt-1">{new Date(attempt.date).toLocaleString()}</p></div><div className="flex items-center gap-6"><div><p className="text-xs text-zinc-600">RECRUIT</p><p className="font-bold">{attempt.recruitScore}/100</p></div><div className="text-2xl font-black text-red-500">{attempt.overall}/100</div></div></div>)}</div></section>
        </> : <section className="mt-8 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center"><p className="text-xs font-bold tracking-[0.2em] text-zinc-500">NO ASSESSMENTS YET</p><h2 className="text-3xl font-black mt-3">Ready to find your CODIQ?</h2><p className="text-zinc-500 mt-3 max-w-md mx-auto">Take your first assessment and your scores, archetype, and history will appear here.</p><Link href="/" className="inline-block mt-6 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3 font-black">TAKE YOUR FIRST TEST</Link></section>}
      </div>
    </main>
  );
}

function Stat({ title, value, suffix = "" }: { title: string; value: number | string; suffix?: string }) {
  return <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"><p className="text-xs font-bold tracking-wider text-zinc-600">{title.toUpperCase()}</p><p className="text-3xl font-black mt-2">{value}<span className="text-sm text-zinc-600">{suffix}</span></p></div>;
}
