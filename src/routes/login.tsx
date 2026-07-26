import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { signIn, supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Connexion — NOVA BNISIT" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#050816" }}>
        <div className="max-w-md text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
          <h1 className="text-2xl font-bold text-white mb-3">Supabase non configuré</h1>
          <Link to="/" className="text-sm text-white/40 hover:text-white">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await signIn(email, password);
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Identifiants incorrects");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#050816" }}>
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>

        <div className="glass-white-strong p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
              <Lock size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Administration</h1>
            <p className="text-sm text-white/40 mt-2">Connectez-vous pour gérer votre site</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@novabnisit.com"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-11 pr-4 py-3 text-white placeholder:text-white/25 transition focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-11 pr-4 py-3 text-white placeholder:text-white/25 transition focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold disabled:opacity-60"
            >
              {status === "loading" ? (
                <><Loader2 size={18} className="animate-spin" /> Connexion…</>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
