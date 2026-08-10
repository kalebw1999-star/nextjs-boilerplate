"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STORAGE_KEY = "codiq-player-profile-v3";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="text-xs font-bold tracking-[0.25em] text-red-500">CODIQ</p>
        <h1 className="text-4xl font-black mt-3">SIGN IN</h1>
        <p className="text-gray-600 mt-3">Sign in to access your player profile and assessments.</p>

        <form onSubmit={submit} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 mt-8 space-y-5">
          <label className="block">
            <span className="text-xs font-bold tracking-wider text-gray-500">USERNAME</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold tracking-wider text-gray-500">PASSWORD</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 px-6 py-3 rounded-xl font-black"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-5 text-center">
          Need an account? <Link href="/signup" className="text-red-500 hover:text-red-400">Create one</Link>
        </p>
      </div>
    </main>
  );
}
