"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Attempt = { date: string; overall: number; recruitScore: number; archetype: string; scores: Record<string, number> };
type Profile = { name: string; createdAt: string; attempts: Attempt[]; bestOverall: number; bestRecruitScore: number };

const labels: Record<string, string> = { decisionMaking: "Decision Making", mapAwareness: "Map Awareness", teamIQ: "Team IQ", objectiveIQ: "Objective IQ", gunfightIQ: "Gunfight IQ", adaptability: "Adaptability" };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" }).then(async (r) => {
      const data = await r.json();
      if (r.status === 401) { router.replace("/login"); return; }
      if (!r.ok) throw new Error(data.error ?? "Unable to load profile.");
      setProfile(data.profile);
    }).catch((e) => setError(e.message));
  }, [router]);

  if (error) return <main className="min-h-screen bg-black text-white flex items-center justify-center"><p className="text-red-400">{error}</p></main>;
  if (!profile) return <main className="min-h-screen bg-black text-white flex items-center justify-center">Loading profile...</main>;
  const latest = profile.attempts[profile.attempts.length - 1];

  return <main className="min-h-screen bg-black text-white px-5 py-8 sm:px-8"><div className="max-w-5xl mx-auto"><header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"><div><p className="text-xs font-black tracking-[0.3em] text-red-500">CALL OF DUTY ESPORTS REPORTER</p><h1 className="text-4xl font-black mt-2">PLAYER PROFILE</h1><p className="text-zinc-500 mt-2">{profile.name} · Member since {new Date(profile.createdAt).toLocaleDateString()}</p></div><div className="flex gap-3"><Link href="/dashboard" className="rounded-xl border border-zinc-800 px-5 py-3 font-bold">DASHBOARD</Link><Link href="/" className="rounded-xl bg-red-600 px-5 py-3 font-black">TAKE TEST</Link></div></header><section className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card label="Tests" value={profile.attempts.length.toString()} /><Card label="Best Overall" value={`${profile.bestOverall}/100`} /><Card label="Best Recruit" value={`${profile.bestRecruitScore}/100`} /><Card label="Latest" value={latest ? `${latest.overall}/100` : "—"} /></section>{latest ? <section className="mt-6 bg-zinc-950 border border-zinc-800 rounded-3xl p-6"><p className="text-xs tracking-[0.2em] text-zinc-500 font-bold">LATEST PROFILE</p><h2 className="text-3xl font-black mt-2">{latest.archetype}</h2><p className="text-zinc-600 mt-1">{new Date(latest.date).toLocaleString()}</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">{Object.entries(latest.scores).map(([key, value]) => <div key={key} className="bg-zinc-900 rounded-2xl p-4"><div className="flex justify-between"><span className="text-zinc-400">{labels[key] ?? key}</span><b>{value}</b></div><div className="h-2 bg-zinc-800 rounded-full mt-3"><div className="h-full bg-red-600 rounded-full" style={{ width: `${value}%` }} /></div></div>)}</div></section> : <section className="mt-6 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center"><h2 className="text-2xl font-black">Your profile is ready.</h2><p className="text-zinc-500 mt-2">Complete your first assessment to build your player profile.</p></section>}</div></main>;
}

function Card({ label, value }: { label: string; value: string }) { return <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"><p className="text-xs font-bold tracking-wider text-zinc-600">{label.toUpperCase()}</p><p className="text-3xl font-black mt-2">{value}</p></div>; }
