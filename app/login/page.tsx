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

  return <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative overflow-hidden"><div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.12),transparent_45%)]" /><div className="w-full max-w-md relative"><div className="mb-8"><p className="text-xs font-bold tracking-[0.25em] text-red-500">CALL OF DUTY ESPORTS RECRUITER</p><div className="flex items-end justify-between gap-4"><div><h1 className="text-4xl font-black mt-3 tracking-tight">SIGN IN</h1><p className="text-gray-500 mt-3">Access your player profile and assessments.</p></div><span className="hidden sm:block text-[10px] font-black tracking-[0.2em] text-zinc-700 border border-zinc-800 rounded-full px-3 py-1">CODIQ</span></div></div><form onSubmit={submit} className="bg-zinc-950/95 border border-zinc-800 rounded-3xl p-7 shadow-2xl shadow-red-950/10 space-y-5"><label className="block"><span className="text-xs font-bold tracking-wider text-gray-500">USERNAME</span><input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required placeholder="Enter your username" className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500/40 placeholder:text-zinc-700" /></label><label className="block"><span className="text-xs font-bold tracking-wider text-gray-500">PASSWORD</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required placeholder="Enter your password" className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500/40 placeholder:text-zinc-700" /></label>{error && <p className="text-sm text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl px-4 py-3">{error}</p>}<button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 transition px-6 py-3 rounded-xl font-black">{loading ? "SIGNING IN..." : "SIGN IN"}</button></form><p className="text-sm text-gray-600 mt-5 text-center">Need an account? <Link href="/signup" className="text-red-500 hover:text-red-400">Create one</Link></p></div></main>;
}