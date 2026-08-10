"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Unable to sign in."); return; }
      router.push("/dashboard"); router.refresh();
    } catch { setError("Unable to reach the server. Please try again."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen text-white flex items-center justify-center px-5 py-10 relative overflow-hidden">
    <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
    <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
    <div className="w-full max-w-6xl grid lg:grid-cols-[1.15fr_.85fr] gap-8 lg:gap-16 items-center relative">
      <section className="hidden lg:block px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] font-black tracking-[.22em] text-red-400"><span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,35,60,.8)]" />RECRUITING INTELLIGENCE PLATFORM</div>
        <h1 className="text-6xl xl:text-7xl font-black tracking-[-.06em] leading-[.92] mt-7">FIND THE<br /><span className="text-red-500">NEXT PLAYER.</span></h1>
        <p className="text-zinc-400 text-lg leading-8 max-w-xl mt-7">Turn competitive decision-making into a player profile your team can actually use. Scenario testing, performance history, and recruiting tools in one place.</p>
        <div className="grid grid-cols-3 gap-3 max-w-xl mt-10">
          {[["30","SCENARIOS"],["6","IQ CATEGORIES"],["1","PLAYER DNA"]].map(([value,label]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="text-2xl font-black">{value}</p><p className="text-[10px] tracking-[.18em] text-zinc-500 font-bold mt-1">{label}</p></div>)}
        </div>
      </section>
      <section className="w-full max-w-md mx-auto">
        <div className="mb-6 lg:hidden"><p className="text-xs font-black tracking-[.25em] text-red-500">CALL OF DUTY ESPORTS REPORTER</p></div>
        <div className="rounded-[28px] border border-white/10 bg-[#0a0a0f]/95 p-7 sm:p-9 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-7"><div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center font-black shadow-lg shadow-red-600/20">CR</div><p className="text-xs font-bold tracking-[.2em] text-red-400 mt-5">PLAYER ACCESS</p><h2 className="text-4xl font-black tracking-tight mt-2">WELCOME BACK.</h2><p className="text-zinc-500 mt-2">Sign in to continue your recruiting profile.</p></div>
          <form onSubmit={submit} className="space-y-5">
            <label className="block"><span className="text-[11px] font-black tracking-[.16em] text-zinc-500">USERNAME</span><input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required placeholder="Enter your username" className="mt-2 w-full rounded-xl border border-white/10 px-4 py-3.5 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10" /></label>
            <label className="block"><span className="text-[11px] font-black tracking-[.16em] text-zinc-500">PASSWORD</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required placeholder="Enter your password" className="mt-2 w-full rounded-xl border border-white/10 px-4 py-3.5 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10" /></label>
            {error && <p className="text-sm text-red-300 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
            <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 transition px-6 py-3.5 rounded-xl font-black shadow-lg shadow-red-600/10">{loading ? "AUTHENTICATING..." : "ENTER RECRUITING HUB →"}</button>
          </form>
          <div className="flex items-center gap-3 my-7"><div className="h-px bg-white/10 flex-1" /><span className="text-[10px] text-zinc-600 font-bold tracking-widest">OR</span><div className="h-px bg-white/10 flex-1" /></div>
          <p className="text-sm text-zinc-500 text-center">New player? <Link href="/signup" className="text-red-400 hover:text-red-300 font-bold">Build your profile</Link></p>
        </div>
        <p className="text-center text-[10px] text-zinc-700 tracking-[.18em] font-bold mt-5">COMPETITIVE PLAYER ASSESSMENT • PRIVATE PROFILE</p>
      </section>
    </div>
  </main>;
}
