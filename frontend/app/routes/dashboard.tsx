import * as React from "react";
import { User2, Lock, ArrowRight } from "lucide-react";
import { redirect } from "react-router";
import { getSession } from "~/utils/session.server";
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(
        request.headers.get("Cookie"),
    );

    console.log("session:", session)

    if (!session.has('user')) {
        return redirect("/")
    }
}
  

export default function Dashboard() {

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-50">
      {/* Nav / Brand */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <a href="#" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">★</span>
          <span className="text-lg font-semibold tracking-tight text-neutral-800">Noosify</span>
        </a>
      </header>

      {/* Main card */}
      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-4">

        {/* Right: Auth card */}
        <div className="relative mx-auto w-full max-w-md rounded-2xl border border-neutral-200/70 bg-white/70 p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md md:p-8">
        {/* subtle highlight */}
        <div className="pointer-events-none absolute inset-x-0 -top-1 mx-auto h-1 w-40 rounded-full opacity-80" />

        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">DASHBOARD HJHJHJ</h2>

        </div>
      </main>
    </div>
  );
}
