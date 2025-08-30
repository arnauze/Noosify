import * as React from "react";
import { User2, Lock, ArrowRight } from "lucide-react";
import type { Route } from "./+types/register";
import { commitSession, getSession } from  "~/utils/session.server";
import { redirect, useActionData } from "react-router";
import type { User } from "~/models/user";
import Header from "~/components/Header";

export async function action({
  request,
}: Route.ActionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password") as string;
  const confirm_password = form.get("confirm_password") as string;

  const create_user_url = process.env.BACKEND_URL + "/users/create"
  const body = JSON.stringify({
    "username": username,
    "password": password,
    "confirm_password": confirm_password
  })

  const response = await fetch(create_user_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body
  })

  if (!response.ok) {
    const errorText = await response.text();
    return JSON.parse(errorText)
  }

  const data = await response.json()
  const user = data["user"] as User

  session.set("userId", user.username);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function RegisterPage() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const actionData = useActionData<{ detail?: string }>();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-50">
      
      <Header />

      {/* Main card */}
      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-4">
        <div className="relative mx-auto w-full max-w-md rounded-2xl border border-neutral-200/70 bg-white/70 p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md md:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Inscription
          </h2>

          <form method="post" className="mt-6 space-y-4" onSubmit={() => setLoading(true)}>
            {/* Username */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">
              Nom d'utilisateur
              </span>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  name="username"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nom d'utilisateur"
                  className="w-full rounded-xl border border-neutral-300/80 bg-white px-10 py-3 text-[0.95rem] text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200/80"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">
                Mot de passe
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-300/80 bg-white px-10 py-3 text-[0.95rem] text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </label>

            {/* Confirm Password */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">
                Confirmez le mot de passe
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-300/80 bg-white px-10 py-3 text-[0.95rem] text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200/80"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
                >
                  {showConfirmPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </label>

            {/* Error message */}
            {actionData?.detail && (
              <p className="pt-2 text-center text-sm text-red-500 font-medium">{actionData.detail}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (confirmPassword != password)}
              className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Création…
                </span>
              ) : (
                <>
                  Créer un compte
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <p className="pt-2 text-center text-sm text-neutral-600">
              Déjà un compte ?{" "}
              <a
                href="/"
                className="font-medium text-neutral-800 underline-offset-2 hover:underline"
              >
                Connectez-vous
              </a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}