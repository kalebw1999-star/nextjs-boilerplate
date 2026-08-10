"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const PROFILE_KEY = "codiq-player-profile-v3";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const publicPath = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();

        if (!data.user) {
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
          }
        }

        if (active) setReady(true);
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

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading CODIQ…</p>
      </main>
    );
  }

  return <>{children}</>;
}
