import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getAuthStatusFn, loginFn } from "@/api/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Connexion — NOVA BNISIT" },
    ],
  }),
  loader: async () => {
    const { authenticated } = await getAuthStatusFn();
    return { authenticated };
  },
  component: AdminLogin,
});

const MESSAGES: Record<string, string> = {
  INVALID_PASSWORD: "Mot de passe incorrect.",
  TOO_MANY_ATTEMPTS: "Trop de tentatives. Réessayez dans 15 minutes.",
  NO_PASSWORD_CONFIGURED:
    "Aucun mot de passe configuré sur le serveur (ADMIN_PASSWORD_HASH).",
  UNAUTHORIZED: "Session expirée.",
};

function AdminLogin() {
  const router = useRouter();
  const { authenticated } = Route.useLoaderData();

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (authenticated) {
    router.navigate({ to: "/admin" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password || busy) return;

    setBusy(true);
    setError("");

    try {
      await loginFn({ data: { password } });
      await router.invalidate();
      await router.navigate({ to: "/admin" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "UNKNOWN";
      setError(MESSAGES[message] ?? "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "#050816" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="NOVA BNISIT" className="mx-auto h-20" />
          <h1 className="mt-4 text-xl font-bold text-white">Administration</h1>
          <p className="mt-1 text-sm text-white/40">
            Connectez-vous pour gérer le site.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass space-y-4 p-6">
          <div>
            <label
              htmlFor="pwd"
              className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40"
            >
              Mot de passe
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
              />
              <input
                id="pwd"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                autoComplete="current-password"
                required
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 py-3 pl-11 pr-11 text-white transition focus:border-[color:var(--brand-2)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/70"
                tabIndex={-1}
                aria-label={show ? "Masquer" : "Afficher"}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !password}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Connexion…
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} /> Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
