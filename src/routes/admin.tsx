import {
  createFileRoute,
  Link,
  useRouter,
  redirect,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  Briefcase,
  Quote,
  HelpCircle,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Save,
  Trash2,
  Pencil,
  X,
  Loader2,
  AlertCircle,
  Check,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Database,
  FileCode,
} from "lucide-react";
import { getAuthStatusFn, logoutFn } from "@/api/auth";
import {
  deleteFaqFn,
  deleteProjectFn,
  deleteServiceFn,
  deleteTestimonialFn,
  getAdminContentFn,
  reorderFn,
  saveFaqFn,
  saveProjectFn,
  saveServiceFn,
  saveSettingsFn,
  saveTestimonialFn,
} from "@/api/content";
import {
  deleteMessageFn,
  getMessagesFn,
  getStatsFn,
  setMessageReadFn,
} from "@/api/messages";
import { MAX_UPLOAD_BYTES, uploadImageFn } from "@/api/upload";

const MAX_MB = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024);
import {
  faqs as fallbackFaqs,
  services as fallbackServices,
} from "@/data/site";

// ============================================================

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Administration — NOVA BNISIT" },
    ],
  }),
  // Garde d'UX seulement. La vraie sécurité est dans requireAdmin()
  // sur chaque server fn : un appel direct sans session est refusé.
  beforeLoad: async () => {
    const { authenticated } = await getAuthStatusFn();
    if (!authenticated) throw redirect({ to: "/login" });
  },
  loader: async () => {
    const [content, messages, stats] = await Promise.all([
      getAdminContentFn(),
      getMessagesFn(),
      getStatsFn(),
    ]);
    return { content, messages, stats };
  },
  component: Admin,
});

type Tab =
  | "dashboard"
  | "contacts"
  | "projects"
  | "services"
  | "testimonials"
  | "faqs"
  | "settings";

const NAV: Array<{
  key: Tab;
  label: string;
  icon: typeof MessageSquare;
  color: string;
}> = [
  {
    key: "dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    color: "#38BDF8",
  },
  { key: "contacts", label: "Messages", icon: MessageSquare, color: "#2563EB" },
  { key: "projects", label: "Portfolio", icon: FolderOpen, color: "#10B981" },
  { key: "services", label: "Services", icon: Briefcase, color: "#F59E0B" },
  { key: "testimonials", label: "Témoignages", icon: Quote, color: "#8B5CF6" },
  { key: "faqs", label: "FAQ", icon: HelpCircle, color: "#EC4899" },
  {
    key: "settings",
    label: "Coordonnées",
    icon: SettingsIcon,
    color: "#64748B",
  },
];

// ─── Helpers ──────────────────────────────────────────────

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED")
      return "Session expirée — reconnectez-vous.";
    return error.message.replace(/^Server function error:\s*/, "");
  }
  return "Erreur inconnue.";
}

function Admin() {
  const router = useRouter();
  const { content, messages, stats } = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("dashboard");

  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  function flash(kind: "ok" | "error", text: string) {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 4000);
  }

  /** Enveloppe une server fn : gère les erreurs + rafraîchit les données. */
  async function run(fn: () => Promise<unknown>, successText: string) {
    try {
      await fn();
      await router.invalidate();
      flash("ok", successText);
      return true;
    } catch (error) {
      flash("error", errorMessage(error));
      return false;
    }
  }

  async function handleLogout() {
    await logoutFn();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen" style={{ background: "#050816" }}>
      <div className="flex">
        {/* ── Sidebar ── */}
        <aside
          className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5"
          style={{ background: "rgba(8,12,24,0.97)" }}
        >
          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
            <img src="/favicon.png" alt="" className="h-10 w-10" />
            <div>
              <p className="text-sm font-bold text-white">NOVA BNISIT</p>
              <p className="text-[10px] uppercase tracking-wider text-white/30">
                Administration
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV.map((item) => {
              const active = tab === item.key;
              const badge =
                item.key === "contacts" && stats.unread > 0
                  ? stats.unread
                  : null;
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition"
                  style={{
                    background: active ? `${item.color}1A` : "transparent",
                    color: active ? item.color : "rgba(255,255,255,0.55)",
                    border: `1px solid ${active ? `${item.color}33` : "transparent"}`,
                  }}
                >
                  <item.icon size={17} />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {badge && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: item.color }}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-white/5 px-3 py-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400/80 transition hover:bg-red-500/10"
            >
              <LogOut size={17} /> Déconnexion
            </button>
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition hover:text-white"
            >
              <ExternalLink size={17} /> Voir le site
            </Link>
          </div>
        </aside>

        {/* ── Contenu ── */}
        <main className="ml-64 flex-1 p-8">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              {NAV.find((n) => n.key === tab)?.label}
            </h1>
            <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <Database size={12} />
              {content.projects.length || content.settings.email
                ? "Base connectée"
                : "Mode fichier"}
            </span>
          </header>

          {notice && (
            <div
              className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
              style={{
                background:
                  notice.kind === "ok"
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(239,68,68,0.1)",
                color: notice.kind === "ok" ? "#34D399" : "#F87171",
              }}
            >
              {notice.kind === "ok" ? (
                <Check size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {notice.text}
            </div>
          )}

          {tab === "dashboard" && (
            <Dashboard
              stats={stats}
              content={content}
              messages={messages}
              onJump={setTab}
            />
          )}
          {tab === "contacts" && <Messages messages={messages} run={run} />}
          {tab === "projects" && <Projects content={content} run={run} />}
          {tab === "services" && (
            <ServicesAdmin rows={content.services} run={run} />
          )}
          {tab === "testimonials" && (
            <TestimonialsAdmin rows={content.testimonials} run={run} />
          )}
          {tab === "faqs" && <FaqsAdmin rows={content.faqs} run={run} />}
          {tab === "settings" && (
            <SettingsAdmin settings={content.settings} run={run} />
          )}
        </main>
      </div>
    </div>
  );
}

type RunFn = (
  fn: () => Promise<unknown>,
  successText: string,
) => Promise<boolean>;

// ─── Tableau de bord ──────────────────────────────────────

function Dashboard({
  stats,
  content,
  messages,
  onJump,
}: {
  stats: { total: number; unread: number };
  content: Awaited<ReturnType<typeof getAdminContentFn>>;
  messages: Awaited<ReturnType<typeof getMessagesFn>>;
  onJump: (tab: Tab) => void;
}) {
  const cards = [
    {
      label: "Messages reçus",
      value: stats.total,
      icon: MessageSquare,
      color: "#2563EB",
    },
    { label: "Non lus", value: stats.unread, icon: Mail, color: "#EF4444" },
    {
      label: "Projets",
      value: content.projects.length,
      icon: FolderOpen,
      color: "#10B981",
    },
    {
      label: "Services",
      value: content.services.length,
      icon: Briefcase,
      color: "#F59E0B",
    },
    {
      label: "Témoignages",
      value: content.testimonials.length,
      icon: Quote,
      color: "#8B5CF6",
    },
    {
      label: "FAQ",
      value: content.faqs.length,
      icon: HelpCircle,
      color: "#EC4899",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="glass flex items-center gap-4 p-5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `${card.color}1A`,
                border: `1px solid ${card.color}33`,
              }}
            >
              <card.icon size={19} style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">{card.value}</p>
              <p className="text-xs text-white/40">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Derniers messages</h2>
            <button
              onClick={() => onJump("contacts")}
              className="text-xs text-[color:var(--brand-2)] hover:underline"
            >
              Tout voir
            </button>
          </div>
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/30">
              Aucun message pour l'instant.
            </p>
          ) : (
            <ul className="space-y-3">
              {messages.slice(0, 5).map((m) => (
                <li
                  key={m.id}
                  className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0"
                >
                  {!m.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#38BDF8]" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {m.name}{" "}
                      <span className="text-white/30">— {m.email}</span>
                    </p>
                    <p className="truncate text-xs text-white/40">
                      {m.message}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass space-y-3 p-6">
          <h2 className="font-semibold text-white">Raccourcis</h2>
          {[
            {
              tab: "projects" as Tab,
              label: "Ajouter un projet au portfolio",
              icon: FolderOpen,
            },
            {
              tab: "contacts" as Tab,
              label: "Lire les messages des clients",
              icon: MessageSquare,
            },
            {
              tab: "settings" as Tab,
              label: "Modifier email / téléphone / WhatsApp",
              icon: SettingsIcon,
            },
            {
              tab: "services" as Tab,
              label: "Éditer les services",
              icon: Briefcase,
            },
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => onJump(item.tab)}
              className="flex w-full items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 text-left text-sm text-white/70 transition hover:bg-white/[0.07]"
            >
              <item.icon size={16} className="text-white/40" />
              {item.label}
            </button>
          ))}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-200/80">
            Si une section affiche 0 élément, c'est qu'aucune ligne n'existe
            encore en base — le site affiche alors le contenu de{" "}
            <code className="text-amber-200">src/data/site.ts</code>. Ajoutez un
            élément pour prendre le contrôle.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Messages ─────────────────────────────────────────────

function Messages({
  messages,
  run,
}: {
  messages: Awaited<ReturnType<typeof getMessagesFn>>;
  run: RunFn;
}) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const shown =
    filter === "unread" ? messages.filter((m) => !m.read) : messages;

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="Aucun message"
        text="Les messages envoyés via le formulaire de contact apparaîtront ici."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["all", "unread"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="rounded-xl px-4 py-2 text-sm font-medium transition"
            style={{
              background:
                filter === key ? "rgba(56,189,248,0.12)" : "transparent",
              color: filter === key ? "#38BDF8" : "rgba(255,255,255,0.5)",
              border: `1px solid ${filter === key ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {key === "all"
              ? `Tous (${messages.length})`
              : `Non lus (${messages.filter((m) => !m.read).length})`}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/30">
          Aucun message non lu.
        </p>
      ) : (
        shown.map((m) => (
          <article
            key={m.id}
            className="glass p-5"
            style={{
              borderLeft: `3px solid ${m.read ? "transparent" : "#38BDF8"}`,
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">
                  {m.name}
                  {!m.read && (
                    <span className="ml-2 rounded-full bg-[#38BDF8] px-2 py-0.5 text-[10px] font-bold text-[#050816]">
                      nouveau
                    </span>
                  )}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-white/40">
                  <a
                    href={`mailto:${m.email}`}
                    className="hover:text-[color:var(--brand-2)]"
                  >
                    {m.email}
                  </a>
                  {m.company && <span>{m.company}</span>}
                  <span>{new Date(m.created_at).toLocaleString("fr-FR")}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    run(
                      () =>
                        setMessageReadFn({ data: { id: m.id, read: !m.read } }),
                      "Statut mis à jour",
                    )
                  }
                  className="btn-ghost rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  <Eye size={13} className="mr-1 inline" />
                  {m.read ? "Marquer non lu" : "Marquer lu"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Supprimer ce message ?")) {
                      run(
                        () => deleteMessageFn({ data: { id: m.id } }),
                        "Message supprimé",
                      );
                    }
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={13} className="mr-1 inline" />
                  Supprimer
                </button>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap border-t border-white/5 pt-4 text-sm leading-relaxed text-white/70">
              {m.message}
            </p>
          </article>
        ))
      )}
    </div>
  );
}

// ─── Projets ──────────────────────────────────────────────

const EMPTY_PROJECT = {
  id: null as number | null,
  title: "",
  category: "",
  description: "",
  image_url: "",
  link_url: "",
  sort_order: 0,
};

function Projects({
  content,
  run,
}: {
  content: Awaited<ReturnType<typeof getAdminContentFn>>;
  run: RunFn;
}) {
  const [editing, setEditing] = useState<typeof EMPTY_PROJECT | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const rows = content.projects;
  const isFallback = rows.length === 0;

  async function handleUpload(file: File) {
    if (!editing) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      setUploadError(
        `${file.name} fait ${mb} Mo — la limite est ${MAX_MB} Mo.`,
      );
      return;
    }
    setUploadError(null);
    setUploading(true);
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () =>
        reject(new Error("Lecture du fichier impossible."));
      reader.readAsDataURL(file);
    });
    const ok = await run(
      () =>
        uploadImageFn({
          data: { filename: file.name, contentType: file.type, base64 },
        }).then((res) => {
          setEditing((current) =>
            current ? { ...current, image_url: res.url } : current,
          );
        }),
      "Image envoyée",
    );
    if (!ok) setUploading(false);
    setUploading(false);
  }

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200/80">
          Aucun projet en base — le site affiche les 3 projets de{" "}
          <code>src/data/site.ts</code>. Ajoutez un projet pour qu'il prenne le
          dessus.
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() =>
            setEditing({ ...EMPTY_PROJECT, sort_order: rows.length + 1 })
          }
          className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} /> Nouveau projet
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((project, index) => (
          <article key={project.id} className="glass overflow-hidden">
            <div className="relative aspect-[4/3] bg-white/[0.03]">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon size={32} className="text-white/10" />
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white/70">
                #{index + 1}
              </span>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand-2)]">
                {project.category}
              </p>
              <h3 className="mt-1 font-bold text-white">{project.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-white/40">
                {project.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-1">
                  <IconButton
                    icon={ArrowUp}
                    label="Monter"
                    disabled={index === 0}
                    onClick={() =>
                      move(rows, index, index - 1, "projects", run)
                    }
                  />
                  <IconButton
                    icon={ArrowDown}
                    label="Descendre"
                    disabled={index === rows.length - 1}
                    onClick={() =>
                      move(rows, index, index + 1, "projects", run)
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditing({
                        id: project.id,
                        title: project.title,
                        category: project.category,
                        description: project.description,
                        image_url: project.image_url,
                        link_url: project.link_url,
                        sort_order: project.sort_order,
                      })
                    }
                    className="btn-ghost rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white"
                  >
                    <Pencil size={13} className="mr-1 inline" />
                    Éditer
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer « ${project.title} » ?`)) {
                        run(
                          () => deleteProjectFn({ data: { id: project.id } }),
                          "Projet supprimé",
                        );
                      }
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing && (
        <ProjectModal
          value={editing}
          uploading={uploading}
          uploadError={uploadError}
          onUpload={handleUpload}
          onClose={() => {
            setEditing(null);
            setUploadError(null);
          }}
          onSave={async (value) => {
            const ok = await run(
              () => saveProjectFn({ data: value }),
              "Projet enregistré",
            );
            if (ok) setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ProjectModal({
  value,
  uploading,
  uploadError,
  onUpload,
  onClose,
  onSave,
}: {
  value: typeof EMPTY_PROJECT;
  uploading: boolean;
  uploadError: string | null;
  onUpload: (file: File) => void;
  onClose: () => void;
  onSave: (value: typeof EMPTY_PROJECT) => void;
}) {
  const [form, setForm] = useState(value);

  useEffect(() => {
    setForm((f) =>
      f.image_url === value.image_url
        ? f
        : { ...f, image_url: value.image_url },
    );
  }, [value.image_url]);
  const set = <K extends keyof typeof EMPTY_PROJECT>(
    key: K,
    v: (typeof EMPTY_PROJECT)[K],
  ) => setForm((f) => ({ ...f, [key]: v }));

  return (
    <Modal
      title={value.id ? "Modifier le projet" : "Nouveau projet"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <Field
          label="Titre"
          value={form.title}
          onChange={(v) => set("title", v)}
          required
        />
        <Field
          label="Catégorie"
          value={form.category}
          onChange={(v) => set("category", v)}
          placeholder="SaaS · Analytique"
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(v) => set("description", v)}
        />

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Image
          </label>
          {form.image_url && (
            <img
              src={form.image_url}
              alt=""
              className="mb-3 h-32 w-full rounded-xl object-cover"
            />
          )}
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
              className="hidden"
              id="project-image"
            />
            <label
              htmlFor="project-image"
              className="btn-ghost flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white/70 hover:text-white"
            >
              {uploading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <ImageIcon size={15} />
              )}
              {uploading ? "Envoi…" : "Choisir un fichier"}
            </label>
            <input
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              placeholder="…ou collez une URL https://"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-[color:var(--brand-2)] focus:outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-white/25">
            JPEG, PNG, WebP, AVIF ou GIF — {MAX_MB} Mo maximum. L'envoi de
            fichier nécessite Vercel Blob ; sans lui, collez une URL.
          </p>
          {uploadError && (
            <p className="mt-2 text-xs text-red-300/90">{uploadError}</p>
          )}
        </div>

        <Field
          label="Lien externe"
          value={form.link_url}
          onChange={(v) => set("link_url", v)}
          placeholder="https://…"
        />

        <ModalActions onClose={onClose} onSave={() => onSave(form)} />
      </div>
    </Modal>
  );
}

// ─── Services ─────────────────────────────────────────────

const ICON_CHOICES = [
  "Code2",
  "Brain",
  "BarChart3",
  "Zap",
  "Rocket",
  "Shield",
  "Headphones",
  "Globe",
  "Wrench",
  "Compass",
  "Mail",
  "Phone",
  "MapPin",
  "Award",
  "Users",
  "TrendingUp",
  "Star",
];

const EMPTY_SERVICE = {
  id: null as number | null,
  title: "",
  description: "",
  icon: "Code2",
  color: "#2563EB",
  sort_order: 0,
};

function ServicesAdmin({
  rows,
  run,
}: {
  rows: Awaited<ReturnType<typeof getAdminContentFn>>["services"];
  run: RunFn;
}) {
  const [editing, setEditing] = useState<typeof EMPTY_SERVICE | null>(null);
  const isFallback = rows.length === 0;

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200/80">
          Aucun service en base — le site affiche les {fallbackServices.length}{" "}
          services de <code>src/data/site.ts</code>.
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() =>
            setEditing({ ...EMPTY_SERVICE, sort_order: rows.length + 1 })
          }
          className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} /> Nouveau service
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="glass flex items-center gap-4 p-4">
            <div
              className="h-10 w-10 shrink-0 rounded-xl"
              style={{
                background: `${row.color}22`,
                border: `1px solid ${row.color}44`,
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{row.title}</p>
              <p className="truncate text-xs text-white/40">
                {row.description}
              </p>
            </div>
            <code className="hidden rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/40 sm:block">
              {row.icon} · #{index + 1}
            </code>
            <div className="flex items-center gap-1">
              <IconButton
                icon={ArrowUp}
                label="Monter"
                disabled={index === 0}
                onClick={() => move(rows, index, index - 1, "services", run)}
              />
              <IconButton
                icon={ArrowDown}
                label="Descendre"
                disabled={index === rows.length - 1}
                onClick={() => move(rows, index, index + 1, "services", run)}
              />
              <button
                onClick={() =>
                  setEditing({
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    icon: row.icon,
                    color: row.color,
                    sort_order: row.sort_order,
                  })
                }
                className="btn-ghost rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer « ${row.title} » ?`)) {
                    run(
                      () => deleteServiceFn({ data: { id: row.id } }),
                      "Service supprimé",
                    );
                  }
                }}
                className="rounded-lg px-3 py-1.5 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal
          title={editing.id ? "Modifier le service" : "Nouveau service"}
          onClose={() => setEditing(null)}
        >
          <div className="space-y-4">
            <Field
              label="Titre"
              value={editing.title}
              onChange={(v) => setEditing({ ...editing, title: v })}
              required
            />
            <Textarea
              label="Description"
              value={editing.description}
              onChange={(v) => setEditing({ ...editing, description: v })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Icône
                </label>
                <select
                  value={editing.icon}
                  onChange={(e) =>
                    setEditing({ ...editing, icon: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0a0f1e] px-4 py-2.5 text-sm text-white focus:border-[color:var(--brand-2)] focus:outline-none"
                >
                  {ICON_CHOICES.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Couleur
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editing.color}
                    onChange={(e) =>
                      setEditing({ ...editing, color: e.target.value })
                    }
                    className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                  />
                  <input
                    value={editing.color}
                    onChange={(e) =>
                      setEditing({ ...editing, color: e.target.value })
                    }
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white focus:border-[color:var(--brand-2)] focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <ModalActions
              onClose={() => setEditing(null)}
              onSave={async () => {
                const ok = await run(
                  () => saveServiceFn({ data: editing }),
                  "Service enregistré",
                );
                if (ok) setEditing(null);
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Témoignages ───────────────────────────────────────────

const EMPTY_TESTIMONIAL = {
  id: null as number | null,
  name: "",
  role: "",
  quote: "",
  sort_order: 0,
};

function TestimonialsAdmin({
  rows,
  run,
}: {
  rows: Awaited<ReturnType<typeof getAdminContentFn>>["testimonials"];
  run: RunFn;
}) {
  const [editing, setEditing] = useState<typeof EMPTY_TESTIMONIAL | null>(null);
  const isFallback = rows.length === 0;

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200/80">
          Aucun témoignage en base — le site affiche ceux de{" "}
          <code>src/data/site.ts</code>.
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() =>
            setEditing({ ...EMPTY_TESTIMONIAL, sort_order: rows.length + 1 })
          }
          className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} /> Nouveau témoignage
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-white">{row.name}</p>
                <p className="text-xs text-white/40">{row.role || "—"}</p>
                <p className="mt-3 border-l-2 border-[color:var(--brand-2)] pl-4 text-sm italic text-white/60">
                  « {row.quote} »
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <IconButton
                  icon={ArrowUp}
                  label="Monter"
                  disabled={index === 0}
                  onClick={() =>
                    move(rows, index, index - 1, "testimonials", run)
                  }
                />
                <IconButton
                  icon={ArrowDown}
                  label="Descendre"
                  disabled={index === rows.length - 1}
                  onClick={() =>
                    move(rows, index, index + 1, "testimonials", run)
                  }
                />
                <button
                  onClick={() =>
                    setEditing({
                      id: row.id,
                      name: row.name,
                      role: row.role,
                      quote: row.quote,
                      sort_order: row.sort_order,
                    })
                  }
                  className="btn-ghost rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Supprimer le témoignage de ${row.name} ?`)) {
                      run(
                        () => deleteTestimonialFn({ data: { id: row.id } }),
                        "Témoignage supprimé",
                      );
                    }
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal
          title={editing.id ? "Modifier le témoignage" : "Nouveau témoignage"}
          onClose={() => setEditing(null)}
        >
          <div className="space-y-4">
            <Field
              label="Nom"
              value={editing.name}
              onChange={(v) => setEditing({ ...editing, name: v })}
              required
            />
            <Field
              label="Fonction / Société"
              value={editing.role}
              onChange={(v) => setEditing({ ...editing, role: v })}
              placeholder="PDG, Sonatrach Digital"
            />
            <Textarea
              label="Citation"
              value={editing.quote}
              onChange={(v) => setEditing({ ...editing, quote: v })}
              rows={5}
            />
            <ModalActions
              onClose={() => setEditing(null)}
              onSave={async () => {
                const ok = await run(
                  () => saveTestimonialFn({ data: editing }),
                  "Témoignage enregistré",
                );
                if (ok) setEditing(null);
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────

const EMPTY_FAQ = {
  id: null as number | null,
  question: "",
  answer: "",
  sort_order: 0,
};

function FaqsAdmin({
  rows,
  run,
}: {
  rows: Awaited<ReturnType<typeof getAdminContentFn>>["faqs"];
  run: RunFn;
}) {
  const [editing, setEditing] = useState<typeof EMPTY_FAQ | null>(null);
  const isFallback = rows.length === 0;

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200/80">
          Aucune FAQ en base — le site affiche les {fallbackFaqs.length}{" "}
          questions de <code>src/data/site.ts</code>.
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() =>
            setEditing({ ...EMPTY_FAQ, sort_order: rows.length + 1 })
          }
          className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} /> Nouvelle question
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-white">
                  <span className="mr-2 text-white/25">{index + 1}.</span>
                  {row.question}
                </p>
                <p className="mt-2 text-sm text-white/50">{row.answer}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <IconButton
                  icon={ArrowUp}
                  label="Monter"
                  disabled={index === 0}
                  onClick={() => move(rows, index, index - 1, "faqs", run)}
                />
                <IconButton
                  icon={ArrowDown}
                  label="Descendre"
                  disabled={index === rows.length - 1}
                  onClick={() => move(rows, index, index + 1, "faqs", run)}
                />
                <button
                  onClick={() =>
                    setEditing({
                      id: row.id,
                      question: row.question,
                      answer: row.answer,
                      sort_order: row.sort_order,
                    })
                  }
                  className="btn-ghost rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Supprimer cette question ?")) {
                      run(
                        () => deleteFaqFn({ data: { id: row.id } }),
                        "Question supprimée",
                      );
                    }
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal
          title={editing.id ? "Modifier la question" : "Nouvelle question"}
          onClose={() => setEditing(null)}
        >
          <div className="space-y-4">
            <Field
              label="Question"
              value={editing.question}
              onChange={(v) => setEditing({ ...editing, question: v })}
              required
            />
            <Textarea
              label="Réponse"
              value={editing.answer}
              onChange={(v) => setEditing({ ...editing, answer: v })}
              rows={5}
            />
            <p className="text-xs text-white/25">
              La FAQ alimente aussi les données structurées schema.org (bon pour
              le référencement Google).
            </p>
            <ModalActions
              onClose={() => setEditing(null)}
              onSave={async () => {
                const ok = await run(
                  () => saveFaqFn({ data: editing }),
                  "Question enregistrée",
                );
                if (ok) setEditing(null);
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Coordonnées ──────────────────────────────────────────

const SETTING_FIELDS: Array<{
  key: string;
  label: string;
  icon: typeof Mail;
  type: string;
  placeholder: string;
}> = [
  {
    key: "email",
    label: "Email de réception",
    icon: Mail,
    type: "email",
    placeholder: "contact@exemple.com",
  },
  {
    key: "phone",
    label: "Téléphone (affiché)",
    icon: Phone,
    type: "tel",
    placeholder: "+212 6 00 00 00 00",
  },
  {
    key: "phone_raw",
    label: "Téléphone (lien tel:)",
    icon: Phone,
    type: "tel",
    placeholder: "+212600000000",
  },
  {
    key: "whatsapp",
    label: "Lien WhatsApp",
    icon: Globe,
    type: "url",
    placeholder: "https://wa.me/212…",
  },
  {
    key: "address",
    label: "Adresse",
    icon: MapPin,
    type: "text",
    placeholder: "Khenifra, Maroc",
  },
  {
    key: "hours",
    label: "Horaires",
    icon: Clock,
    type: "text",
    placeholder: "Lun – Ven · 9h00 – 19h00",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Globe,
    type: "url",
    placeholder: "https://facebook.com/…",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: Globe,
    type: "url",
    placeholder: "https://instagram.com/…",
  },
  {
    key: "site_description",
    label: "Description (pied de page + SEO)",
    icon: FileCode,
    type: "text",
    placeholder: "Solutions numériques et IA premium…",
  },
];

function SettingsAdmin({
  settings,
  run,
}: {
  settings: Record<string, string>;
  run: RunFn;
}) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of SETTING_FIELDS)
      initial[field.key] = settings[field.key] ?? "";
    return initial;
  });

  const dirty = SETTING_FIELDS.some(
    (f) => (form[f.key] ?? "") !== (settings[f.key] ?? ""),
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-[#38BDF8]/20 bg-[#38BDF8]/5 p-4 text-sm text-white/60">
        Ces informations remplacent celles de{" "}
        <code className="text-[color:var(--brand-2)]">src/data/site.ts</code>.
        Laissez un champ vide pour garder la valeur du fichier.
      </div>

      <div className="space-y-4">
        {SETTING_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              <field.icon size={13} /> {field.label}
            </label>
            <input
              type={field.type}
              value={form[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) =>
                setForm((f) => ({ ...f, [field.key]: e.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[color:var(--brand-2)] focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        disabled={!dirty}
        onClick={() =>
          run(
            () => saveSettingsFn({ data: { settings: form } }),
            "Coordonnées enregistrées",
          )
        }
        className="btn-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold disabled:opacity-40"
      >
        <Save size={16} /> {dirty ? "Enregistrer" : "Aucune modification"}
      </button>
    </div>
  );
}

// ─── Composants utilitaires ────────────────────────────────

function move<T extends { id: number }>(
  rows: T[],
  from: number,
  to: number,
  table: string,
  run: RunFn,
) {
  if (to < 0 || to >= rows.length) return;
  const ids = rows.map((r) => r.id);
  const [moved] = ids.splice(from, 1);
  ids.splice(to, 0, moved);
  return run(() => reorderFn({ data: { table, ids } }), "Ordre mis à jour");
}

function IconButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: typeof ArrowUp;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
    >
      <Icon size={13} />
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div
        className="glass-white-strong my-8 w-full max-w-lg rounded-2xl p-6"
        style={{ background: "rgba(10,15,30,0.98)" }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
      <button
        onClick={onClose}
        className="btn-ghost rounded-xl px-5 py-2.5 text-sm text-white/60 hover:text-white"
      >
        Annuler
      </button>
      <button
        onClick={onSave}
        className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
      >
        <Save size={15} /> Enregistrer
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[color:var(--brand-2)] focus:outline-none"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[color:var(--brand-2)] focus:outline-none"
      />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Mail;
  title: string;
  text: string;
}) {
  return (
    <div className="glass flex flex-col items-center gap-3 py-20 text-center">
      <Icon size={36} className="text-white/10" />
      <p className="font-semibold text-white/70">{title}</p>
      <p className="max-w-sm text-sm text-white/30">{text}</p>
    </div>
  );
}
