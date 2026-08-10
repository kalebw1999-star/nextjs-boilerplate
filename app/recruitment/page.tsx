import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../auth";

export const dynamic = "force-dynamic";

const ADMIN_USERNAME = "kynetic";

export default async function RecruitmentPage() {
  const user = await getCurrentUser();

  if (!user || String(user.username).toLowerCase() !== ADMIN_USERNAME) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-black text-white px-5 py-8 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-black tracking-[0.3em] text-red-500">CALL OF DUTY ESPORTS RECRUITER</p>
            <h1 className="text-4xl font-black mt-2">RECRUITMENT</h1>
            <p className="text-zinc-500 mt-2">Admin recruitment tools will live here.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-zinc-800 px-5 py-3 font-bold text-zinc-300 hover:bg-zinc-900">DASHBOARD</Link>
        </header>

        <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8">
          <p className="text-xs font-bold tracking-[0.2em] text-red-500">ADMIN ONLY</p>
          <h2 className="text-2xl font-black mt-2">Recruitment</h2>
          <p className="text-zinc-500 mt-3">This section is reserved for the recruiter account. Recruitment management tools can be added here next.</p>
        </section>
      </div>
    </main>
  );
}
