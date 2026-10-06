import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  ArrowRight,
  Star,
  Code2,
  Brain,
  BarChart3,
  Zap,
  Check,
  Rocket,
  Compass,
  Wrench,
  PartyPopper,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Menu,
  X,
  Plus,
  Minus,
  Monitor,
  Shield,
  Clock,
  Headphones,
  Globe,
  ChevronRight,
  Send,
  Play,
  Users,
  Award,
  TrendingUp,
  ArrowUpRight,
  Quote,
  Loader2,
  AlertCircle,
  Image,
  Images,
  ZoomIn,
  ExternalLink,
  Facebook,
  Instagram,
} from "lucide-react";
import { sendContactMessage } from "@/lib/contact";
import { resolveContent } from "@/lib/resolve-content";
import type { ContactInfo } from "@/lib/resolve-content";
import { getPublicContentFn } from "@/api/content";
import { site, navLinks } from "@/data/site";
import type { Faq, Project, Service, Testimonial } from "@/data/site";
import type { LucideIcon } from "lucide-react";
import robotImg from "@/assets/robot.png";
import whyImg from "@/assets/why-us.jpg";

export const Route = createFileRoute("/")({
  // Le contenu vient de la base s'il y en a une, sinon de src/data/site.ts.
  loader: async () => {
    const content = await getPublicContentFn();
    return { resolved: resolveContent(content) };
  },
  component: Landing,
});

const nav = navLinks;

/**
 * Smooth-scroll vers une section par son id, en tenant compte de la navbar
 * fixe. `scroll-padding-top` (voir styles.css) fait déjà le décalage ; on
 * passe par scrollIntoView pour éviter de dependre du hash.
 */
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

/** Lien de section du footer : même navigation que la navbar. */
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        scrollToSection(href.slice(1));
      }}
      className="hover:text-white transition-colors"
    >
      {children}
    </a>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40, rotateX: 8 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50, rotateY: -10, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 50, rotateY: 10, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

const fadeScale3D = {
  hidden: { opacity: 0, scale: 0.85, rotateX: 12, rotateY: -5 },
  show: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    transition: { duration: 0.9, ease: "easeOut" as const },
  },
};

const flipUp = {
  hidden: { opacity: 0, y: 60, rotateX: 25, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { duration: 0.9, ease: "easeOut" as const },
  },
};

const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  Brain,
  BarChart3,
  Zap,
  Rocket,
  Shield,
  Headphones,
  Globe,
  Wrench,
  Compass,
  Mail,
  Phone,
  MapPin,
  Award,
  Users,
  TrendingUp,
  Star,
};

function Landing() {
  const { resolved } = Route.useLoaderData();
  const { services, projects, testimonials, faqs, contact, description } =
    resolved;

  return (
    <div
      className="relative min-h-screen overflow-x-clip"
      style={{ background: "#050816" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.name,
            url: site.url,
            description: site.tagline,
            address: {
              "@type": "PostalAddress",
              addressLocality: site.city,
              addressCountry: site.country,
            },
            contactPoint: {
              "@type": "ContactPoint",
              email: contact.email,
              telephone: contact.phone,
              contactType: "customer service",
            },
            sameAs: [contact.facebook, contact.instagram],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: site.url,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        }}
      />
      <BackgroundFX />
      <Navbar projectsCount={projects.length} />
      <main>
        <Hero />
        <StatsBar />
        <Services items={services} />
        <WhyUs />
        <Portfolio items={projects} />
        <Process />
        <Testimonials items={testimonials} />
        <FAQ items={faqs} />
        <CTA />
        <Contact contact={contact} />
      </main>
      <Footer contact={contact} description={description} />
    </div>
  );
}

/* ---------------- Background ---------------- */
function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div
        className="absolute -top-40 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.3), transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/4 -right-60 h-[600px] w-[600px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.2), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-1/4 -left-60 h-[500px] w-[500px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%)",
        }}
      />
      <Particles />
    </div>
  );
}

function Particles() {
  const dots = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0">
      {dots.map((_, i) => {
        const size = 1.5 + Math.random() * 2.5;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 5;
        const dur = 8 + Math.random() * 12;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background:
                i % 3 === 0
                  ? "rgba(255,255,255,0.6)"
                  : i % 3 === 1
                    ? "#38BDF8"
                    : "#2563EB",
              boxShadow: `0 0 ${size * 3}px ${i % 3 === 0 ? "rgba(255,255,255,0.4)" : i % 3 === 1 ? "#38BDF8" : "#2563EB"}`,
              animation: `drift ${dur}s ease-in-out ${delay}s infinite`,
              opacity: 0.4,
            }}
          />
        );
      })}
    </div>
  );
}

/* ---------------- Navbar ---------------- */
function Navbar({ projectsCount }: { projectsCount: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Referme le menu mobile : avec Échap, et au passage en affichage large
  // (sinon il resterait ouvert, invisible, une fois le breakpoint md franchi).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onWide = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open]);
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-2xl bg-[#050816]/80 border-b border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("home");
          }}
          className="flex items-center"
        >
          <img src="/logo.png" alt="NOVA BNISIT" className="h-20" />
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(n.href.slice(1));
              }}
              className="text-sm font-medium text-white/60 transition hover:text-white relative group"
            >
              {n.label}
              {n.href === "#portfolio" && projectsCount > 0 && (
                <span className="ml-1.5 rounded-full bg-[color:var(--brand-2)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[color:var(--brand-2)] ring-1 ring-[color:var(--brand-2)]/30">
                  {projectsCount}
                </span>
              )}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("contact");
            }}
            className="hidden md:inline-flex btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            Demander un devis
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="btn-ghost relative flex h-11 w-11 items-center justify-center rounded-xl text-white md:hidden"
          >
            {projectsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--brand-2)] text-[9px] font-bold text-black ring-1 ring-white/20">
                {projectsCount}
              </span>
            )}
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            id="mobile-nav"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="border-t border-white/5 bg-[#050816]/98 shadow-[0_24px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    // Laisse le menu se replier avant de défiler, sinon le
                    // scroll part pendant l'animation de fermeture.
                    requestAnimationFrame(() =>
                      scrollToSection(n.href.slice(1)),
                    );
                  }}
                  className="flex items-center gap-2 rounded-lg px-2 py-3 text-lg text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {n.label}
                  {n.href === "#portfolio" && projectsCount > 0 && (
                    <span className="rounded-full bg-[color:var(--brand-2)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[color:var(--brand-2)] ring-1 ring-[color:var(--brand-2)]/30">
                      {projectsCount}
                    </span>
                  )}
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  requestAnimationFrame(() => scrollToSection("contact"));
                }}
                className="btn-primary mt-2 rounded-xl px-5 py-3 text-center font-semibold"
              >
                Demander un devis
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      setMouse({ x, y });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative z-10 pt-28 pb-14 md:pt-36 md:pb-20"
      style={{ perspective: "1200px" }}
    >
      <div
        className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            variants={fadeUp}
            className="glass-white inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider text-white/90"
          >
            <Sparkles size={14} className="text-[color:var(--brand-2)]" />
            SOLUTIONS IA POUR ENTREPRISES
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mt-6 font-extrabold tracking-tight text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
          >
            <span className="text-gradient">Digital</span> &{" "}
            <span className="text-gradient">AI</span> Solutions
            <br />
            Transformer votre activité
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-lg text-base leading-relaxed text-white/50"
          >
            Nous concevons des sites web premium, des systèmes d'automatisation
            par IA et des solutions data-driven qui accélèrent la croissance de
            votre entreprise.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-7 flex flex-wrap items-center gap-4"
          >
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
              className="btn-primary group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold"
            >
              Démarrer un projet
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </a>
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("services");
              }}
              className="btn-white group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold"
            >
              Découvrir nos services
            </a>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex items-center gap-6"
          >
            <div className="flex -space-x-3">
              {["A", "K", "S", "M"].map((l, i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#050816]"
                  style={{
                    background: `linear-gradient(135deg, ${i % 2 ? "#38BDF8" : "#2563EB"}, ${i % 2 ? "#2563EB" : "#38BDF8"})`,
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-white">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-white/40 mt-0.5">
                <span className="text-white font-semibold">50+</span>{" "}
                entreprises nous font confiance
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative mx-auto flex h-[380px] w-full max-w-[420px] items-center justify-center"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-[320px] w-[320px] rounded-full animate-pulse-glow"
              style={{
                background:
                  "radial-gradient(circle, rgba(37,99,235,0.4), rgba(56,189,248,0.12) 40%, transparent 70%)",
              }}
            />
          </div>
          {[
            { label: "IA", icon: Brain, top: "8%", left: "-6%", delay: 0 },
            {
              label: "Automatisation",
              icon: Zap,
              top: "30%",
              left: "-14%",
              delay: 0.4,
            },
            {
              label: "Analytique",
              icon: BarChart3,
              top: "55%",
              left: "-6%",
              delay: 0.8,
            },
            {
              label: "Développement",
              icon: Code2,
              top: "78%",
              left: "4%",
              delay: 1.2,
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.15 }}
              style={{
                top: c.top,
                left: c.left,
                transform: `translate(${mouse.x * -15}px, ${mouse.y * -15}px)`,
                animationDelay: `${c.delay}s`,
              }}
              className="absolute z-20 animate-float-slow glass-white flex items-center gap-2.5 px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: "rgba(37,99,235,0.15)",
                  border: "1px solid rgba(56,189,248,0.3)",
                }}
              >
                <c.icon size={14} className="text-[color:var(--brand-2)]" />
              </div>
              <span className="text-xs font-semibold text-white whitespace-nowrap">
                {c.label}
              </span>
            </motion.div>
          ))}
          <div
            className="relative z-10 animate-float"
            style={{
              transform: `translate(${mouse.x * 10}px, ${mouse.y * 10}px)`,
            }}
          >
            <img
              src={robotImg}
              alt="NOVA BNISIT - Assistant IA"
              width={360}
              height={360}
              decoding="async"
              className="relative z-10 h-[360px] w-auto drop-shadow-[0_20px_50px_rgba(37,99,235,0.35)]"
            />
            <div
              className="absolute -bottom-2 left-1/2 h-4 w-48 -translate-x-1/2 rounded-full blur-xl"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(56,189,248,0.5), transparent 70%)",
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Stats Bar ---------------- */
function StatsBar() {
  const stats = [
    { value: "50+", label: "Projets livrés", icon: Award },
    { value: "98%", label: "Clients satisfaits", icon: Users },
    { value: "3x", label: "ROI moyen", icon: TrendingUp },
    { value: "24/7", label: "Support dédié", icon: Headphones },
  ];
  return (
    <section className="relative z-10 py-6">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="glass-white-strong rounded-2xl p-1 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))",
          }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="flex items-center gap-4 bg-[#0a0f1e]/80 backdrop-blur-xl px-6 py-5"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(37,99,235,0.12)",
                  border: "1px solid rgba(56,189,248,0.2)",
                }}
              >
                <s.icon size={20} className="text-[color:var(--brand-2)]" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Services ---------------- */
function Services({ items }: { items: Service[] }) {
  const list = items.map((s) => ({
    icon: ICON_MAP[s.icon] || Code2,
    title: s.title,
    desc: s.desc,
    color: s.color,
  }));
  return (
    <section
      id="services"
      className="relative z-10 py-28"
      style={{ perspective: "1200px" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Nos expertises"
          title="Des services à la pointe"
          subtitle="Une gamme complète de solutions numériques pour propulser votre entreprise vers le succès."
        />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          style={{ transformStyle: "preserve-3d" }}
        >
          {list.map((s, i) => (
            <motion.div
              key={s.title}
              variants={flipUp}
              whileHover={{
                y: -8,
                rotateX: 4,
                rotateY: -3,
                scale: 1.03,
                transition: { duration: 0.3 },
              }}
              className="group relative overflow-hidden glass p-7 cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                transitionDelay: `${i * 0.05}s`,
              }}
              onClick={() => scrollToSection("portfolio")}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  scrollToSection("portfolio");
                }
              }}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${s.color}15, transparent 60%)`,
                }}
              />
              <div className="relative">
                <div
                  className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: `${s.color}18`,
                    border: `1px solid ${s.color}35`,
                  }}
                >
                  <s.icon size={24} className="text-[color:var(--brand-2)]" />
                </div>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/45">
                  {s.desc}
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 group-hover:text-[color:var(--brand-2)] transition-colors">
                  En savoir plus{" "}
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Why Us ---------------- */
function WhyUs() {
  const features = [
    {
      icon: Rocket,
      title: "Livraison Express",
      desc: "Respectez vos délais grâce à notre méthodologie agile et itérative.",
    },
    {
      icon: Shield,
      title: "Qualité Premium",
      desc: "Chaque pixel, chaque ligne de code est pensé pour l'excellence.",
    },
    {
      icon: Brain,
      title: "Expertise IA",
      desc: "Maîtrise des dernières technologies : GPT, Claude, Gemini, modèles open-source.",
    },
    {
      icon: Headphones,
      title: "Support 24/7",
      desc: "Une équipe dédiée disponible pour vous accompagner à tout moment.",
    },
  ];
  return (
    <section id="about" className="relative z-10 py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group perspective-[1200px]"
        >
          {/* Outer glow */}
          <div
            className="absolute -inset-10 rounded-[36px] blur-3xl opacity-50"
            style={{
              background:
                "radial-gradient(circle, rgba(37,99,235,0.4), transparent 70%)",
            }}
          />

          {/* 3D rotating card */}
          <div
            className="relative rounded-[28px] overflow-hidden cursor-pointer"
            style={{
              animation: "why-3d-float 6s ease-in-out infinite",
              transformStyle: "preserve-3d",
            }}
            onMouseMove={(e) => {
              const rect = (
                e.currentTarget as HTMLElement
              ).getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width - 0.5;
              const y = (e.clientY - rect.top) / rect.height - 0.5;
              (e.currentTarget as HTMLElement).style.transform =
                `perspective(800px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) scale(1.05)`;
              (e.currentTarget as HTMLElement).style.animation = "none";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "";
              (e.currentTarget as HTMLElement).style.animation = "";
            }}
          >
            {/* Glass border glow */}
            <div
              className="absolute -inset-px rounded-[28px] opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, rgba(56,189,248,0.4), rgba(37,99,235,0.2), transparent, rgba(56,189,248,0.3))",
              }}
            />

            {/* Inner container */}
            <div
              className="relative glass overflow-hidden"
              style={{ borderRadius: "28px" }}
            >
              <img
                src={whyImg}
                alt="Réseau IA"
                width={1200}
                height={1200}
                loading="lazy"
                decoding="async"
                className="h-[460px] w-full object-cover"
                style={{ animation: "why-img-pan 8s ease-in-out infinite" }}
              />

              {/* Animated gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  animation: "why-overlay-shift 6s ease-in-out infinite",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050816]/70 via-transparent to-[#050816]/30" />
              </div>

              {/* Floating light beam */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute -top-20 -left-20 h-60 w-[500px] rotate-[35deg] opacity-20"
                  style={{
                    animation: "why-beam 5s ease-in-out infinite",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  }}
                />
              </div>

              {/* Corner accents */}
              <div
                className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: "rgba(37,99,235,0.3)",
                  border: "1px solid rgba(56,189,248,0.4)",
                  animation: "why-corner-pulse 3s ease-in-out infinite",
                }}
              >
                <Brain size={14} className="text-[color:var(--brand-2)]" />
              </div>
              <div
                className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: "rgba(37,99,235,0.3)",
                  border: "1px solid rgba(56,189,248,0.4)",
                  animation: "why-corner-pulse 3s ease-in-out 1.5s infinite",
                }}
              >
                <Zap size={14} className="text-[color:var(--brand-2)]" />
              </div>
            </div>
          </div>

          {/* Floating particles around image */}
          {[
            { size: 6, x: -20, y: 30, delay: 0 },
            { size: 4, x: 520, y: 80, delay: 1 },
            { size: 5, x: 100, y: 440, delay: 2 },
            { size: 3, x: 480, y: 380, delay: 0.5 },
            { size: 8, x: -10, y: 250, delay: 1.5 },
            { size: 4, x: 500, y: 200, delay: 0.8 },
            { size: 5, x: 250, y: -10, delay: 2.5 },
            { size: 3, x: 350, y: 460, delay: 0.3 },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                background:
                  i % 3 === 0
                    ? "#2563EB"
                    : i % 3 === 1
                      ? "#38BDF8"
                      : "rgba(255,255,255,0.7)",
                boxShadow: `0 0 ${p.size * 5}px ${i % 3 === 0 ? "#2563EB" : i % 3 === 1 ? "#38BDF8" : "rgba(255,255,255,0.5)"}`,
                animation: `why-particle ${2.5 + i * 0.4}s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-2)]">
            Pourquoi nous
          </p>
          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            L'excellence au service
            <br />
            de votre <span className="text-gradient">croissance</span>
          </h2>
          <p className="mt-6 text-lg text-white/45 max-w-lg leading-relaxed">
            Une équipe de niche composée d'ingénieurs, designers et spécialistes
            IA, livrant des résultats qui impactent réellement vos métriques
            business.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i }}
                className="group flex gap-4 p-3 rounded-2xl transition-colors hover:bg-white/[0.03]"
              >
                <div
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(37,99,235,0.1)",
                    border: "1px solid rgba(56,189,248,0.2)",
                  }}
                >
                  <f.icon size={20} className="text-[color:var(--brand-2)]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{f.title}</h4>
                  <p className="mt-1 text-sm text-white/40 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Portfolio ---------------- */

type Card = {
  img?: string;
  title: string;
  cat: string;
  desc: string;
  link: string;
  type: string;
  gallery: string[];
  mode: "site" | "gallery";
};

function projectMode(p: { type?: string; link?: string }): "site" | "gallery" {
  const t = (p.type ?? "").trim().toLowerCase();
  if (t === "website" || t === "webapp") return "site";
  if (t === "graphic" || t === "branding" || t === "design") return "gallery";
  // Heuristique : sans type explicite, un lien externe = projet site.
  return (p.link ?? "").trim() ? "site" : "gallery";
}

function projectGallery(p: { img?: string; images?: string[] }): string[] {
  const imgs = Array.isArray(p.images)
    ? p.images.filter(
        (u): u is string => typeof u === "string" && u.trim() !== "",
      )
    : [];
  if (imgs.length > 0) return imgs;
  return p.img ? [p.img] : [];
}

function Portfolio({ items }: { items: Project[] }) {
  const list: Card[] = items.map((p) => {
    const gallery = projectGallery(p);
    return {
      img: p.img ?? gallery[0],
      title: p.title,
      cat: p.category,
      desc: p.desc,
      link: (p.link ?? "").trim(),
      type: (p.type ?? "").trim() || (p.link ? "website" : "graphic"),
      gallery,
      mode: projectMode(p),
    };
  });
  const [selected, setSelected] = useState<Card | null>(null);
  return (
    <section id="portfolio" className="relative z-10 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Nos réalisations"
          title={`Projets Sélectionnés — ${items.length}`}
          subtitle="Un aperçu des systèmes que nous avons livrés à nos clients premium."
        />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3"
          style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
        >
          {list.map((p, i) => (
            <motion.div
              key={p.title}
              variants={flipUp}
              className="group relative overflow-hidden glass cursor-pointer"
              onClick={() => setSelected(p)}
              // Zoom "loupe" : le point d'origine suit le curseur.
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const r = el.getBoundingClientRect();
                el.style.setProperty(
                  "--zx",
                  `${((e.clientX - r.left) / r.width) * 100}%`,
                );
                el.style.setProperty(
                  "--zy",
                  `${((e.clientY - r.top) / r.height) * 100}%`,
                );
              }}
              whileHover={{
                y: -10,
                rotateX: 5,
                rotateY: -3,
                scale: 1.03,
                transition: { duration: 0.3 },
              }}
              style={{
                transformStyle: "preserve-3d",
                transitionDelay: `${i * 0.05}s`,
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {p.img ? (
                  <img
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    width={600}
                    height={450}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform [transform-origin:var(--zx,50%)_var(--zy,50%)] group-hover:scale-[1.4] group-focus-visible:scale-[1.4]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white/[0.03]">
                    <Image size={40} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/20 to-transparent" />
                {p.link && (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-[#050816]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur">
                    Lien disponible
                  </span>
                )}

                {/* Nombre de captures */}
                {p.gallery.length > 1 && (
                  <span className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-[#050816]/80 px-2.5 py-1 text-[10px] font-bold text-white/80 ring-1 ring-white/20 backdrop-blur">
                    <Images size={11} />
                    {p.gallery.length}
                  </span>
                )}

                {/* Pastille zoom */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.25)",
                      }}
                    >
                      <ZoomIn size={22} className="text-white" />
                    </span>
                    <span className="text-[11px] font-semibold text-white/85">
                      {p.mode === "site" ? "Voir le projet" : "Agrandir"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-2)]">
                  {p.cat}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-white/40 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Project Detail Modal */}
      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

/* ---------------- Project Modal ---------------- */
function ProjectModal({
  project,
  onClose,
}: {
  project: Card;
  onClose: () => void;
}) {
  const shots = project.gallery;
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  const total = shots.length;
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const current = shots[safeIndex];

  const go = useCallback(
    (delta: number) =>
      setIndex((i) => (total ? (i + delta + total) % total : 0)),
    [total],
  );

  useEffect(() => {
    setIndex(0);
    setZoom(false);
  }, [project.title]);

  // Verrouille le scroll de la page + navigation clavier quand le modal est ouvert.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoom) setZoom(false);
        else onClose();
        return;
      }
      if (zoom) return;
      if (project.mode === "site") {
        if (e.key === "ArrowRight" && total > 1) go(1);
        if (e.key === "ArrowLeft" && total > 1) go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose, project.mode, total, zoom]);

  const url = project.link && project.link !== "#" ? project.link : "";

  const actions = (
    <div className="mt-8 flex flex-wrap gap-3">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}
        >
          <ExternalLink size={16} />
          {project.mode === "site" ? "Ouvrir le site" : "Voir le projet"}
        </a>
      ) : (
        <span className="flex items-center gap-2 text-sm text-white/30">
          Aucun lien disponible pour ce projet
        </span>
      )}
      <button
        onClick={onClose}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/50 transition-colors hover:text-white"
      >
        Fermer
      </button>
    </div>
  );

  // Le modal est rendu dans un portail sur <body> : reste dans la section
  // #portfolio, il serait piégé dans son contexte d'empilement (z-10) et
  // passerait sous les sections suivantes (Process, FAQ, Contact…).
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  useEffect(() => setPortal(document.body), []);

  if (!portal) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className={`relative w-full overflow-y-auto rounded-3xl border border-white/10 glass ${
          project.mode === "site" ? "max-w-5xl" : "max-w-4xl"
        } max-h-[88vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white/70 backdrop-blur-sm transition-colors hover:text-white"
        >
          <X size={20} />
        </button>

        {/* ── Aperçu navigateur (site / web app) ── */}
        {project.mode === "site" && (
          <div className="overflow-hidden rounded-t-3xl">
            <div className="flex items-center gap-3 border-b border-white/10 bg-black/40 px-4 py-3">
              <div className="flex shrink-0 gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-auto flex min-w-0 max-w-md flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                <Shield size={11} className="shrink-0 text-emerald-400/70" />
                <span className="truncate text-[11px] text-white/50">
                  {url ||
                    `${project.title.toLowerCase().replace(/\s+/g, "")}.com`}
                </span>
              </div>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ouvrir dans un nouvel onglet"
                  className="shrink-0 text-white/40 transition-colors hover:text-white"
                >
                  <ExternalLink size={15} />
                </a>
              )}
            </div>

            <div className="relative aspect-[16/10] w-full bg-black/50 md:aspect-[16/9]">
              {current ? (
                <>
                  <img
                    src={current}
                    alt={`${project.title} — aperçu ${safeIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent" />
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Monitor size={44} className="text-white/10" />
                </div>
              )}

              {total > 1 && (
                <>
                  <GalleryNav side="left" onClick={() => go(-1)} />
                  <GalleryNav side="right" onClick={() => go(1)} />
                  <span className="absolute bottom-3 right-4 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                    {safeIndex + 1} / {total}
                  </span>
                </>
              )}
            </div>

            {total > 1 && (
              <Thumbnails
                shots={shots}
                active={safeIndex}
                onSelect={setIndex}
              />
            )}
          </div>
        )}

        {/* ── Galerie d'images (graphic / branding / design) ── */}
        {project.mode === "gallery" && (
          <div className="overflow-hidden rounded-t-3xl">
            <div className="relative flex min-h-[240px] items-center justify-center bg-black/40 p-4 md:min-h-[380px]">
              {current ? (
                <button
                  onClick={() => setZoom(true)}
                  aria-label="Agrandir l'image"
                  className="group relative flex max-h-[52vh] w-full cursor-zoom-in items-center justify-center"
                >
                  <img
                    src={current}
                    alt={`${project.title} — image ${safeIndex + 1}`}
                    className="max-h-[52vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl transition duration-300 group-hover:scale-[1.02]"
                  />
                  <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                    <Image size={12} /> Agrandir
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-white/20">
                  <Image size={44} />
                  <span className="text-sm">Aucune image pour ce projet</span>
                </div>
              )}

              {total > 1 && (
                <>
                  <GalleryNav side="left" onClick={() => go(-1)} />
                  <GalleryNav side="right" onClick={() => go(1)} />
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white/70">
                    {safeIndex + 1} / {total}
                  </span>
                </>
              )}
            </div>

            {total > 1 && (
              <Thumbnails
                shots={shots}
                active={safeIndex}
                onSelect={setIndex}
              />
            )}
          </div>
        )}

        {/* ── Texte ── */}
        <div className="p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
            {project.cat}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
            {project.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/50">
            {project.desc}
          </p>
          {actions}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {zoom && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setZoom(false)}
          >
            <button
              onClick={() => setZoom(false)}
              aria-label="Fermer"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:text-white"
            >
              <X size={22} />
            </button>

            <motion.img
              key={current}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              src={current}
              alt={`${project.title} — image ${safeIndex + 1}`}
              className="max-h-[88vh] max-w-full cursor-zoom-out rounded-xl object-contain"
              onClick={() => setZoom(false)}
            />

            {total > 1 && (
              <>
                <GalleryNav side="left" onClick={() => go(-1)} dark />
                <GalleryNav side="right" onClick={() => go(1)} dark />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                  {safeIndex + 1} / {total}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    portal,
  );
}

function GalleryNav({
  side,
  onClick,
  dark,
}: {
  side: "left" | "right";
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Image précédente" : "Image suivante"}
      className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border transition ${
        side === "left" ? "left-3 md:left-4" : "right-3 md:right-4"
      } ${
        dark
          ? "border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          : "border-white/20 bg-black/60 text-white/80 backdrop-blur-sm hover:bg-black/80 hover:text-white"
      }`}
    >
      {side === "left" ? (
        <ChevronRight size={20} className="rotate-180" />
      ) : (
        <ChevronRight size={20} />
      )}
    </button>
  );
}

function Thumbnails({
  shots,
  active,
  onSelect,
}: {
  shots: string[];
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-black/30 px-4 py-3 [scrollbar-width:thin]">
      {shots.map((shot, i) => (
        <button
          key={`${shot}-${i}`}
          onClick={() => onSelect(i)}
          aria-label={`Voir l'image ${i + 1}`}
          aria-current={i === active}
          className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition md:h-16 md:w-24 ${
            i === active
              ? "border-[color:var(--brand-2)] opacity-100"
              : "border-transparent opacity-45 hover:opacity-80"
          }`}
        >
          <img
            src={shot}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}

/* ---------------- Process ---------------- */
const steps = [
  {
    n: "01",
    title: "Découverte",
    desc: "Comprendre vos objectifs, utilisateurs et contraintes.",
    icon: Compass,
  },
  {
    n: "02",
    title: "Planification",
    desc: "Architecturer la feuille de route et le design system.",
    icon: Wrench,
  },
  {
    n: "03",
    title: "Développement",
    desc: "Construire avec rigueur et itération rapide.",
    icon: Rocket,
  },
  {
    n: "04",
    title: "Lancement",
    desc: "Déployer, mesurer et optimiser pour la croissance.",
    icon: PartyPopper,
  },
];

function Process() {
  return (
    <section className="relative z-10 py-28" style={{ perspective: "1200px" }}>
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Notre méthodologie"
          title="Un processus rodé"
          subtitle="Un parcours discipliné de l'idée au lancement, pour des résultats garantis."
        />
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-8 hidden h-px md:block divider-glow" />
          <div
            className="grid grid-cols-1 gap-8 md:grid-cols-4"
            style={{ transformStyle: "preserve-3d" }}
          >
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 50, rotateX: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: "easeOut" }}
                whileHover={{ y: -6, rotateX: -3, scale: 1.04 }}
                className="relative flex flex-col items-center text-center group cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl glass-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-shadow duration-300">
                  <s.icon size={22} className="text-[color:var(--brand-2)]" />
                </div>
                <div className="mt-5 text-xs font-bold tracking-[0.2em] text-white/30">
                  {s.n}
                </div>
                <h3 className="mt-2 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 max-w-[200px] text-sm text-white/40 leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
function Testimonials({ items }: { items: Testimonial[] }) {
  const list = items;
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % list.length), 6000);
    return () => clearInterval(t);
  }, [list.length]);
  return (
    <section className="relative z-10 py-28" style={{ perspective: "1200px" }}>
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeader
          eyebrow="Ils nous recommandent"
          title="Témoignages"
          subtitle=""
        />
        <div className="mt-14 relative min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotateX: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, rotateX: -15, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="glass-white-strong p-12 text-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="flex justify-center mb-6">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(37,99,235,0.15)",
                    border: "1px solid rgba(56,189,248,0.3)",
                  }}
                >
                  <Quote size={20} className="text-[color:var(--brand-2)]" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-medium leading-relaxed text-white/90 italic">
                &laquo; {list[i].quote} &raquo;
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white font-bold text-sm"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {list[i].name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">{list[i].name}</p>
                  <p className="text-sm text-white/40">{list[i].role}</p>
                </div>
              </div>
              <div className="flex justify-center gap-0.5 text-white mt-6">
                {[...Array(5)].map((_, k) => (
                  <Star key={k} size={14} fill="currentColor" />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex justify-center gap-2">
            {list.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                className={`h-1.5 rounded-full transition-all duration-300 ${k === i ? "w-10 bg-white" : "w-2 bg-white/20 hover:bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ({ items }: { items: Faq[] }) {
  const list = items.map((f) => ({ q: f.question, a: f.answer }));
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section
      id="faq"
      className="relative z-10 py-28"
      style={{ perspective: "1200px" }}
    >
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeader
          eyebrow="Questions"
          title="Foire aux Questions"
          subtitle="Tout ce que vous devez savoir avant de démarrer."
        />
        <div
          className="mt-12 space-y-3"
          style={{ transformStyle: "preserve-3d" }}
        >
          {list.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 30, rotateX: 12, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
              whileHover={{ x: 4, rotateY: -1, scale: 1.01 }}
              className={`glass overflow-hidden transition-all duration-300 cursor-pointer ${open === i ? "shadow-[0_0_30px_rgba(37,99,235,0.15)]" : ""}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-6 p-6 text-left"
              >
                <span className="text-base font-semibold text-white/90">
                  {f.q}
                </span>
                <div
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full transition-all duration-300"
                  style={{
                    background:
                      open === i
                        ? "rgba(37,99,235,0.3)"
                        : "rgba(255,255,255,0.05)",
                    border: `1px solid ${open === i ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  {open === i ? (
                    <Minus size={14} className="text-[color:var(--brand-2)]" />
                  ) : (
                    <Plus size={14} className="text-white/50" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-white/40 leading-relaxed text-sm">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA() {
  return (
    <section className="relative z-10 py-28">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[28px] p-16 md:p-20 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(56,189,248,0.12) 50%, rgba(11,18,32,0.95))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "0 30px 100px -20px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(56,189,248,0.4), transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-24 right-0 h-60 w-60 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(37,99,235,0.3), transparent 70%)",
            }}
          />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--brand-2)]">
              Prêt à démarrer ?
            </p>
            <h2 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Construisons votre
              <br />
              prochain <span className="text-gradient">projet IA</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/50 leading-relaxed">
              Réservez un appel de découverte gratuit. Nous répondons sous 24
              heures avec un plan et un chiffrage détaillé.
            </p>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
              className="btn-primary mt-10 inline-flex items-center gap-2 rounded-xl px-10 py-4 text-base font-semibold"
            >
              Démarrer votre projet <ArrowRight size={18} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */
function Contact({ contact }: { contact: ContactInfo }) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "mailto" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = ((fd.get("name") as string) || "").trim();
    const email = ((fd.get("email") as string) || "").trim();
    const company = ((fd.get("company") as string) || "").trim();
    const message = ((fd.get("message") as string) || "").trim();
    const botcheck = fd.get("website");

    if (botcheck) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const result = await sendContactMessage(
        { name, email, company, message },
        contact.email,
      );
      setStatus(
        result === "unavailable"
          ? "error"
          : result === "stored"
            ? "sent"
            : result,
      );
      if (result !== "unavailable") form.reset();
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur inconnue");
    }
    setTimeout(() => setStatus("idle"), 8000);
  }

  return (
    <section
      id="contact"
      className="relative z-10 py-28"
      style={{ perspective: "1200px" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Contactez-nous"
          title="Parlons de votre projet"
          subtitle="Décrivez-nous votre projet et nous vous répondrons sous un jour ouvré."
        />
        <div
          className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-5"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-5"
          >
            {[
              {
                icon: Mail,
                label: "Email",
                value: contact.email,
                href: `mailto:${contact.email}`,
              },
              {
                icon: Phone,
                label: "Téléphone",
                value: contact.phone,
                href: `tel:${contact.phoneRaw}`,
              },
              {
                icon: MapPin,
                label: "Adresse",
                value: contact.address,
                href: undefined,
              },
            ].map((c, ci) => (
              <motion.div
                key={c.label}
                className="glass flex items-center gap-5 p-5 cursor-pointer"
                initial={{ opacity: 0, x: -40, rotateY: -8 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.15, duration: 0.6 }}
                whileHover={{ x: 6, rotateY: 2, scale: 1.02 }}
                onClick={() => {
                  if (c.href) window.location.href = c.href;
                }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(37,99,235,0.1)",
                    border: "1px solid rgba(56,189,248,0.2)",
                  }}
                >
                  <c.icon size={18} className="text-[color:var(--brand-2)]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                    {c.label}
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-white">
                    {c.value}
                  </p>
                </div>
              </motion.div>
            ))}
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="glass flex items-center gap-5 p-5 transition hover:bg-white/[0.06]"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(37,229,74,0.12)",
                  border: "1px solid rgba(37,229,74,0.3)",
                }}
              >
                <Globe size={18} className="text-[#25E74A]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                  WhatsApp
                </p>
                <p className="mt-0.5 text-base font-semibold text-white">
                  Discutons maintenant
                </p>
              </div>
            </a>
            <div className="glass p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                Horaires
              </p>
              <p className="mt-1 font-semibold text-white">{contact.hours}</p>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 glass-white-strong p-8 space-y-5"
          >
            {/* Honeypot anti-spam */}
            <input
              type="text"
              name="website"
              className="hidden"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Nom" name="name" placeholder="Votre nom" />
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="vous@entreprise.com"
              />
            </div>
            <Field
              label="Entreprise"
              name="company"
              placeholder="Nom de l'entreprise"
            />
            <div>
              <label
                htmlFor="msg"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40"
              >
                Message
              </label>
              <textarea
                id="msg"
                name="message"
                rows={5}
                required
                placeholder="Décrivez-nous votre projet…"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-white placeholder:text-white/25 transition focus:border-[color:var(--brand-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/20"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={status === "sending"}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold disabled:opacity-60"
            >
              {status === "sending" && (
                <>
                  <Loader2 size={18} className="animate-spin" /> Envoi…
                </>
              )}
              {status === "sent" && (
                <>
                  <Check size={18} /> Message envoyé !
                </>
              )}
              {status === "mailto" && (
                <>
                  <Mail size={18} /> Votre messagerie s'ouvre…
                </>
              )}
              {status === "error" && (
                <>
                  <AlertCircle size={18} /> {errorMsg || "Erreur, réessayez"}
                </>
              )}
              {status === "idle" && (
                <>
                  Envoyer le message <Send size={16} />
                </>
              )}
            </motion.button>
            {status === "mailto" && (
              <p className="text-center text-xs text-white/40">
                Si rien ne s'ouvre, écrivez-nous directement à{" "}
                <a
                  href={`mailto:${contact.email}`}
                  className="text-[color:var(--brand-2)] underline"
                >
                  {contact.email}
                </a>
              </p>
            )}
            {!status.includes("mailto") && status !== "error" && (
              <p className="text-center text-xs text-white/30">
                Réponse sous un jour ouvré.{" "}
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--brand-2)] underline"
                >
                  Ou écrivez-nous sur WhatsApp
                </a>
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-white placeholder:text-white/25 transition focus:border-[color:var(--brand-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/20"
      />
    </div>
  );
}

/* ---------------- Footer ---------------- */
function Footer({
  contact,
  description,
}: {
  contact: ContactInfo;
  description: string;
}) {
  return (
    <footer
      className="relative z-10 border-t border-white/5 py-14"
      style={{ background: "rgba(8,12,24,0.8)" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="NOVA BNISIT" className="h-20" />
            </div>
            <p className="mt-4 max-w-sm text-sm text-white/35 leading-relaxed">
              {description}
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href={contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl btn-ghost text-white/40 hover:text-white"
                title="Facebook"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl btn-ghost text-white/40 hover:text-white"
                title="Instagram"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl btn-ghost text-white/40 hover:text-white"
                title="WhatsApp"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
              Entreprise
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/35">
              <li>
                <FooterLink href="#about">À propos</FooterLink>
              </li>
              <li>
                <FooterLink href="#portfolio">Portfolio</FooterLink>
              </li>
              <li>
                <FooterLink href="#contact">Contact</FooterLink>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
              Services
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/35">
              <li>
                <FooterLink href="#services">Développement Web</FooterLink>
              </li>
              <li>
                <FooterLink href="#services">
                  Intelligence Artificielle
                </FooterLink>
              </li>
              <li>
                <FooterLink href="#services">Automatisation</FooterLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} {site.name}. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <Link
              to="/mentions-legales"
              className="text-xs text-white/25 hover:text-white/50 transition-colors"
            >
              Mentions légales
            </Link>
            <p className="text-xs text-white/25">Conçu avec précision.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Section Header ---------------- */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-2)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/40">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
