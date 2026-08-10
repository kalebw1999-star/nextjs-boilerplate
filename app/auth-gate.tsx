"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const PROFILE_KEY = "codiq-player-profile-v3";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const publicPath = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();

        if (!data.user) {
          setSignedIn(false);
          if (!publicPath) router.replace("/login");
          if (active) setReady(publicPath);
          return;
        }

        if (publicPath) {
          router.replace("/");
          return;
        }

        const profileResponse = await fetch("/api/profile", { cache: "no-store" });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.profile) {
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData.profile));

            const originalSetItem = localStorage.setItem.bind(localStorage);

            localStorage.setItem = (key: string, value: string) => {
              originalSetItem(key, value);
              if (key === PROFILE_KEY) {
                try {
                  const profile = JSON.parse(value);
                  void fetch("/api/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ attempts: profile.attempts ?? [] }),
                  });
                } catch {
                  // The server remains authoritative if local state is malformed.
                }
              }
            };
          }
        }

        if (active) {
          setSignedIn(true);
          setReady(true);
        }
      } catch {
        if (!publicPath) router.replace("/login");
        if (active) setReady(publicPath);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [pathname, publicPath, router]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Keep the cached profile intact. The server profile is reloaded and overwrites it on the next sign-in.
    setSignedIn(false);
    router.replace("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading CODIQ…</p>
      </main>
    );
  }

  return (
    <>
      {children}
      {signedIn && !publicPath && (
        <button
          onClick={signOut}
          className="fixed bottom-4 right-4 z-50 bg-zinc-900/90 border border-zinc-800 hover:border-red-500/60 text-gray-500 hover:text-white px-3 py-2 rounded-lg text-xs font-bold backdrop-blur"
        >
          SIGN OUT
        </button>
      )}
    </>
  );
}
