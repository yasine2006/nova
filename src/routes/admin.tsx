import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  MessageSquare, Briefcase, Quote, HelpCircle, ArrowLeft, Plus, Trash2,
  Check, Eye, EyeOff, Mail, Building2, Clock, Loader2, AlertCircle,
  Save, X, ChevronDown, ChevronUp, RefreshCw, Image, ExternalLink, Upload, LogOut,
  LayoutDashboard, Pencil, BarChart3, Users, FolderOpen, Star, Zap, TrendingUp,
} from "lucide-react";
import {
  supabaseConfigured, supabase, signOut, getSession,
  getContacts, markContactRead, deleteContact,
  getServices, upsertService, deleteService,
  getTestimonials, upsertTestimonial, deleteTestimonial,
  getFaqs, upsertFaq, deleteFaq,
  getProjects, upsertProject, deleteProject,
  type ContactMessage, type Service, type Testimonial, type FAQ, type Project,
} from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Administration — NOVA BNISIT" },
    ],
  }),
  component: Admin,
});

type Tab = "dashboard" | "contacts" | "services" | "testimonials" | "faqs" | "portfolio";

function Admin() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [authenticated, setAuthenticated] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;
    getSession().then((s) => {
      if (!s) {
        window.location.href = "/login";
      } else {
        setAuthenticated(true);
      }
    });
  }, []);

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#050816" }}>
        <div className="max-w-md text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
          <h1 className="text-2xl font-bold text-white mb-3">Supabase non configuré</h1>
          <p className="text-white/50 text-sm mb-6">
            Ajoutez <code className="text-[#38BDF8]">VITE_SUPABASE_URL</code> et{" "}
            <code className="text-[#38BDF8]">VITE_SUPABASE_ANON_KEY</code> dans votre fichier <code>.env</code>
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050816" }}>
        <Loader2 size={32} className="animate-spin text-[#38BDF8]" />
      </div>
    );
  }

  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    window.location.href = "/login";
  }

  const navItems: { key: Tab; label: string; icon: typeof MessageSquare; color: string }[] = [
    { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, color: "#38BDF8" },
    { key: "contacts", label: "Messages", icon: MessageSquare, color: "#2563EB" },
    { key: "portfolio", label: "Portfolio", icon: FolderOpen, color: "#10B981" },
    { key: "services", label: "Services", icon: Briefcase, color: "#F59E0B" },
    { key: "testimonials", label: "Témoignages", icon: Quote, color: "#8B5CF6" },
    { key: "faqs", label: "FAQ", icon: HelpCircle, color: "#EC4899" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#050816" }}>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5" style={{ background: "rgba(8,12,24,0.95)" }}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <img src="/favicon.png" alt="NOVA BNISIT" className="h-20 w-20 object-contain" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((n) => {
            const active = tab === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "text-white"
                    : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
                style={active ? { background: `${n.color}15`, boxShadow: `inset 3px 0 0 ${n.color}` } : {}}
              >
                <n.icon size={17} style={active ? { color: n.color } : {}} />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3 space-y-2">
          <Link to="/" className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors">
            <ArrowLeft size={16} />
            Voir le site
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl">
          {tab === "dashboard" && <DashboardTab onNavigate={setTab} />}
          {tab === "contacts" && <ContactsTab />}
          {tab === "portfolio" && <PortfolioTab />}
          {tab === "services" && <ServicesTab />}
          {tab === "testimonials" && <TestimonialsTab />}
          {tab === "faqs" && <FaqsTab />}
        </div>
      </main>
    </div>
  );
}

// ─── Dashboard Overview ────────────────────────────────────

function DashboardTab({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const [stats, setStats] = useState({ contacts: 0, unread: 0, services: 0, testimonials: 0, faqs: 0, projects: 0 });
  const [recentContacts, setRecentContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, s, t, f, p] = await Promise.all([getContacts(), getServices(), getTestimonials(), getFaqs(), getProjects()]);
        setStats({
          contacts: c.length,
          unread: c.filter((x) => !x.read).length,
          services: s.length,
          testimonials: t.length,
          faqs: f.length,
          projects: p.length,
        });
        setRecentContacts(c.slice(0, 5));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingState />;

  const cards: { label: string; value: number; icon: typeof MessageSquare; color: string; badge?: number; tab: Tab }[] = [
    { label: "Messages", value: stats.contacts, icon: MessageSquare, color: "#2563EB", badge: stats.unread, tab: "contacts" },
    { label: "Projets", value: stats.projects, icon: FolderOpen, color: "#10B981", tab: "portfolio" },
    { label: "Services", value: stats.services, icon: Briefcase, color: "#F59E0B", tab: "services" },
    { label: "Témoignages", value: stats.testimonials, icon: Quote, color: "#8B5CF6", tab: "testimonials" },
    { label: "FAQ", value: stats.faqs, icon: HelpCircle, color: "#EC4899", tab: "faqs" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
        <p className="text-sm text-white/35 mt-1">Vue d'ensemble de votre site</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onNavigate(c.tab)}
            className="glass p-5 text-left group hover:border-white/15 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-20 w-20 rounded-full blur-3xl opacity-10" style={{ background: c.color }} />
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${c.color}18` }}>
                <c.icon size={18} style={{ color: c.color }} />
              </div>
              {c.badge !== undefined && c.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2563EB] px-1.5 text-[10px] font-bold text-white">
                  {c.badge}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="text-xs text-white/35 mt-0.5">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Recent contacts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Messages récents</h2>
          <button onClick={() => onNavigate("contacts")} className="text-xs text-[#38BDF8] hover:text-[#2563EB] transition-colors">
            Tout voir →
          </button>
        </div>
        {recentContacts.length === 0 ? (
          <div className="glass p-8 text-center">
            <MessageSquare size={32} className="mx-auto text-white/10 mb-3" />
            <p className="text-sm text-white/30">Aucun message</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentContacts.map((c) => (
              <div key={c.id} className={`glass flex items-center justify-between p-4 ${!c.read ? "border-l-2 border-l-[#2563EB]" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${!c.read ? "bg-[#2563EB]/20 text-[#38BDF8]" : "bg-white/5 text-white/30"}`}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.name} {!c.read && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#2563EB]" />}</p>
                    <p className="text-xs text-white/30">{c.email} {c.company ? `· ${c.company}` : ""}</p>
                  </div>
                </div>
                <span className="text-xs text-white/20">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contacts Tab ───────────────────────────────────────────

function ContactsTab() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setContacts(await getContacts()); } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleRead(id: string, current: boolean) {
    await markContactRead(id, !current);
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, read: !current } : c));
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    await deleteContact(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  const unread = contacts.filter((c) => !c.read).length;

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages de contact</h1>
          <p className="text-sm text-white/35 mt-1">{contacts.length} message{contacts.length !== 1 ? "s" : ""} · {unread} non lu{unread !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {contacts.length === 0 ? (
        <EmptyState icon={MessageSquare} text="Aucun message pour l'instant" />
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className={`glass overflow-hidden transition-all ${!c.read ? "border-l-2 border-l-[#2563EB]" : ""}`}>
              <button
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id!)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${!c.read ? "bg-[#2563EB]/20 text-[#38BDF8]" : "bg-white/5 text-white/30"}`}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{c.name} {!c.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#2563EB]" />}</p>
                    <p className="text-xs text-white/35">{c.email} {c.company ? `· ${c.company}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/25">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : ""}
                  </span>
                  {expandedId === c.id ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
                </div>
              </button>
              {expandedId === c.id && (
                <div className="border-t border-white/5 px-5 pb-5">
                  <p className="mt-4 text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{c.message}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => toggleRead(c.id!, c.read!)} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white transition-colors">
                      {c.read ? <><EyeOff size={12} /> Marquer non-lu</> : <><Eye size={12} /> Marquer lu</>}
                    </button>
                    <button onClick={() => handleDelete(c.id!)} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Services Tab ───────────────────────────────────────────

const ICON_OPTIONS = ["Code2", "Brain", "BarChart3", "Zap", "Rocket", "Shield", "Headphones", "Globe", "Wrench", "Compass"];
const COLOR_OPTIONS = ["#2563EB", "#38BDF8", "#60A5FA", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

function ServicesTab() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function load() {
    setLoading(true);
    try { setItems(await getServices()); } catch (e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setIsCreating(true);
    setEditing({ title: "", description: "", icon: "Code2", color: "#2563EB", sort_order: items.length + 1 });
  }

  async function handleSave(s: Service) {
    try { await upsertService(s); await load(); setEditing(null); setIsCreating(false); } catch (e) { console.error(e); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce service ?")) return;
    await deleteService(id);
    setItems((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-sm text-white/35 mt-1">{items.length} service{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={startCreate} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors" style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {editing && <ServiceForm item={editing} onSave={handleSave} onCancel={() => { setEditing(null); setIsCreating(false); }} />}

      {items.length === 0 ? (
        <EmptyState icon={Briefcase} text="Aucun service" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((s) => (
            <div key={s.id} className="glass p-5 group hover:border-white/15 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold" style={{ background: `${s.color}18`, color: s.color }}>
                    {s.icon.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{s.title}</h3>
                    <p className="text-xs text-white/35 mt-0.5 line-clamp-2 max-w-xs">{s.description}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(s)} className="rounded-lg bg-white/5 p-2 text-white/40 hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors" title="Modifier">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(s.id!)} className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:text-red-300 transition-colors" title="Supprimer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceForm({ item, onSave, onCancel }: { item: Service; onSave: (s: Service) => void; onCancel: () => void }) {
  const [form, setForm] = useState(item);
  return (
    <div className="glass p-6 border border-[#2563EB]/30 rounded-2xl">
      <h3 className="text-sm font-bold text-white mb-4">{item.id ? "Modifier le service" : "Nouveau service"}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Icône</label>
          <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:outline-none">
            {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Couleur</label>
          <div className="flex gap-2 mt-2">
            {COLOR_OPTIONS.map((c) => (
              <button key={c} onClick={() => setForm({ ...form, color: c })}
                className={`h-8 w-8 rounded-lg transition-all ${form.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#050816]" : "hover:scale-110"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={() => onSave(form)} className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
          <Check size={14} /> Enregistrer
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
          <X size={14} /> Annuler
        </button>
      </div>
    </div>
  );
}

// ─── Testimonials Tab ───────────────────────────────────────

function TestimonialsTab() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function load() {
    setLoading(true);
    try { setItems(await getTestimonials()); } catch (e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setIsCreating(true);
    setEditing({ name: "", role: "", quote: "", sort_order: items.length + 1 });
  }

  async function handleSave(t: Testimonial) {
    try { await upsertTestimonial(t); await load(); setEditing(null); setIsCreating(false); } catch (e) { console.error(e); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    await deleteTestimonial(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Témoignages</h1>
          <p className="text-sm text-white/35 mt-1">{items.length} témoignage{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={startCreate} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors" style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {editing && <TestimonialForm item={editing} onSave={handleSave} onCancel={() => { setEditing(null); setIsCreating(false); }} />}

      {items.length === 0 ? (
        <EmptyState icon={Quote} text="Aucun témoignage" />
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="glass p-5 group hover:border-white/15 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/25">Témoignage</span>
                  </div>
                  <p className="text-sm text-white/60 italic leading-relaxed">&laquo; {t.quote} &raquo;</p>
                  <p className="mt-2 text-xs text-white/40 font-semibold">{t.name} — {t.role}</p>
                </div>
                <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(t)} className="rounded-lg bg-white/5 p-2 text-white/40 hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors" title="Modifier">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(t.id!)} className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:text-red-300 transition-colors" title="Supprimer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialForm({ item, onSave, onCancel }: { item: Testimonial; onSave: (t: Testimonial) => void; onCancel: () => void }) {
  const [form, setForm] = useState(item);
  return (
    <div className="glass p-6 border border-[#2563EB]/30 rounded-2xl">
      <h3 className="text-sm font-bold text-white mb-4">{item.id ? "Modifier le témoignage" : "Nouveau témoignage"}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="Rôle / Entreprise" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
        <div className="sm:col-span-2">
          <Textarea label="Citation" value={form.quote} onChange={(v) => setForm({ ...form, quote: v })} />
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={() => onSave(form)} className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
          <Check size={14} /> Enregistrer
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
          <X size={14} /> Annuler
        </button>
      </div>
    </div>
  );
}

// ─── FAQs Tab ───────────────────────────────────────────────

function FaqsTab() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function load() {
    setLoading(true);
    try { setItems(await getFaqs()); } catch (e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setIsCreating(true);
    setEditing({ question: "", answer: "", sort_order: items.length + 1 });
  }

  async function handleSave(f: FAQ) {
    try { await upsertFaq(f); await load(); setEditing(null); setIsCreating(false); } catch (e) { console.error(e); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette FAQ ?")) return;
    await deleteFaq(id);
    setItems((prev) => prev.filter((f) => f.id !== id));
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Foire aux Questions</h1>
          <p className="text-sm text-white/35 mt-1">{items.length} question{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={startCreate} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors" style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {editing && <FaqForm item={editing} onSave={handleSave} onCancel={() => { setEditing(null); setIsCreating(false); }} />}

      {items.length === 0 ? (
        <EmptyState icon={HelpCircle} text="Aucune question" />
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="glass p-5 group hover:border-white/15 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{f.question}</p>
                  <p className="mt-1 text-xs text-white/40 leading-relaxed line-clamp-2">{f.answer}</p>
                </div>
                <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(f)} className="rounded-lg bg-white/5 p-2 text-white/40 hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors" title="Modifier">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(f.id!)} className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:text-red-300 transition-colors" title="Supprimer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FaqForm({ item, onSave, onCancel }: { item: FAQ; onSave: (f: FAQ) => void; onCancel: () => void }) {
  const [form, setForm] = useState(item);
  return (
    <div className="glass p-6 border border-[#2563EB]/30 rounded-2xl">
      <h3 className="text-sm font-bold text-white mb-4">{item.id ? "Modifier la question" : "Nouvelle question"}</h3>
      <div className="space-y-4">
        <Input label="Question" value={form.question} onChange={(v) => setForm({ ...form, question: v })} />
        <Textarea label="Réponse" value={form.answer} onChange={(v) => setForm({ ...form, answer: v })} />
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={() => onSave(form)} className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
          <Check size={14} /> Enregistrer
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
          <X size={14} /> Annuler
        </button>
      </div>
    </div>
  );
}

// ─── Portfolio Tab ──────────────────────────────────────────

function PortfolioTab() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function load() {
    setLoading(true);
    try { setItems(await getProjects()); } catch (e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setIsCreating(true);
    setEditing({ title: "", category: "", description: "", image_url: "", link_url: "", sort_order: items.length + 1 });
  }

  async function handleSave(p: Project) {
    try { await upsertProject(p); await load(); setEditing(null); setIsCreating(false); } catch (e) { console.error(e); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce projet ?")) return;
    await deleteProject(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-sm text-white/35 mt-1">{items.length} projet{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={startCreate} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors" style={{ background: "linear-gradient(135deg, #10B981, #34D399)" }}>
          <Plus size={15} /> Nouveau projet
        </button>
      </div>

      {editing && <ProjectForm item={editing} onSave={handleSave} onCancel={() => { setEditing(null); setIsCreating(false); }} />}

      {items.length === 0 ? (
        <EmptyState icon={Image} text="Aucun projet" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="glass overflow-hidden group hover:border-white/15 transition-all">
              <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.03]">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Image size={32} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-60" />
                {/* Overlay actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40">
                  <button onClick={() => setEditing(p)} className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors shadow-lg">
                    <Pencil size={13} /> Modifier
                  </button>
                  {p.link_url && (
                    <a href={p.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors shadow-lg">
                      <ExternalLink size={13} /> Voir
                    </a>
                  )}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#38BDF8]">{p.category}</p>
                  <button onClick={() => handleDelete(p.id!)} className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all" title="Supprimer">
                    <Trash2 size={12} />
                  </button>
                </div>
                <h3 className="font-bold text-white text-sm">{p.title}</h3>
                <p className="mt-1 text-xs text-white/35 leading-relaxed line-clamp-2">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectForm({ item, onSave, onCancel }: { item: Project; onSave: (p: Project) => void; onCancel: () => void }) {
  const [form, setForm] = useState(item);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `project-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("projects").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("projects").getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Erreur lors de l'upload. Vérifiez que le bucket 'projects' existe dans Supabase Storage.");
    }
    setUploading(false);
  }

  return (
    <div className="glass p-6 border border-[#2563EB]/30 rounded-2xl">
      <h3 className="text-sm font-bold text-white mb-4">{item.id ? "Modifier le projet" : "Nouveau projet"}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Titre du projet" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <Input label="Catégorie" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="ex: SaaS · Analytique" />
        <div className="sm:col-span-2">
          <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </div>
        <Input label="Lien du projet (optionnel)" value={form.link_url} onChange={(v) => setForm({ ...form, link_url: v })} placeholder="https://..." />
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Image du projet</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Upload en cours…" : "Choisir une image"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          {form.image_url && (
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Supprimer l'image
            </button>
          )}
        </div>
        <div className="mt-3">
          <Input label="Ou collez une URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} placeholder="https://..." />
        </div>
      </div>

      {form.image_url && (
        <div className="mt-4 rounded-xl overflow-hidden aspect-[4/3] max-w-xs border border-white/10">
          <img src={form.image_url} alt="Aperçu" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
      <div className="flex gap-2 mt-5">
        <button onClick={() => onSave(form)} className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
          <Check size={14} /> Enregistrer
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
          <X size={14} /> Annuler
        </button>
      </div>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 transition focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 transition focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 resize-none" />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#38BDF8]" />
        <p className="text-xs text-white/30">Chargement…</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof MessageSquare; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] mb-4">
        <Icon size={28} className="text-white/10" />
      </div>
      <p className="text-sm text-white/30">{text}</p>
    </div>
  );
}
