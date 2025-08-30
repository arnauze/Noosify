import { useLocation } from "react-router";

export default function Header() {
    const location = useLocation();
    const isDashboard = location.pathname.includes("/dashboard");

    return (
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <a href="/dashboard" className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">★</span>
                <span className="text-lg font-semibold tracking-tight text-neutral-800">Noosify</span>
            </a>
            {isDashboard && (
            <button
                className="rounded-lg bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 transition"
            >
                <a href="/logout">
                    Logout
                </a>
            </button>
            )}
        </header>
    )
}