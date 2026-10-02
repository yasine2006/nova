import project1 from "@/assets/project1.jpg";
import project2 from "@/assets/project2.jpg";
import project3 from "@/assets/project3.jpg";

// ============================================================
//  NOVA BNISIT — Contenu de repli
//
//  Ce fichier sert de source de vérité quand la base de données
//  est absente, vide ou injoignable : le site s'affiche toujours.
//  Dès qu'une ligne existe en base, elle prend le dessus
//  (voir src/lib/resolve-content.ts).
//
//  → Pour modifier le site sans base de données : éditez ce fichier.
//  → Pour modifier le site avec le dashboard : passez par /admin.
// ============================================================

export interface Service {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

export interface Project {
  img?: string;
  title: string;
  category: string;
  desc: string;
  link?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export const site = {
  name: "NOVA BNISIT",
  url: "https://novabnisit.com",
  tagline: "Solutions numériques & IA premium",
  description:
    "Solutions numériques et IA premium, conçues pour les entreprises qui exigent l'excellence.",
  city: "Khenifra",
  country: "MA",
  countryName: "Maroc",
  hours: "Lun – Ven · 9h00 – 19h00",
} as const;

export const contact = {
  email: "novabnisit@gmail.com",
  phone: "+212 6 13 61 26 18",
  phoneRaw: "+212613612618",
  address: `${site.city}, ${site.countryName}`,
  whatsapp: "https://wa.me/212613612618",
  facebook: "https://www.facebook.com/profile.php?id=61589333708080",
  instagram: "https://www.instagram.com/novabnisit.agency/",
} as const;

// ─── Services ──────────────────────────────────────────────
// `icon` doit être un nom présent dans ICON_MAP (src/routes/index.tsx)
// Chaque service occupe 1/4 de ligne sur desktop (grille 4 colonnes).

export const services: Service[] = [
  {
    icon: "Code2",
    title: "Développement Web",
    desc: "Sites et applications web modernes, optimisés pour la rapidité, le SEO et la conversion.",
    color: "#2563EB",
  },
  {
    icon: "Brain",
    title: "Intelligence Artificielle",
    desc: "Systèmes d'IA sur mesure : chatbots, recommandation, prédiction et automatisation intelligente.",
    color: "#38BDF8",
  },
  {
    icon: "BarChart3",
    title: "Analyse de Données",
    desc: "Tableaux de bord, rapports automatisés et insights stratégiques pour piloter vos décisions.",
    color: "#60A5FA",
  },
  {
    icon: "Zap",
    title: "Automatisation",
    desc: "Automatisez vos processus métiers, réduisez les erreurs et libérez du temps pour l'essentiel.",
    color: "#38BDF8",
  },
];

// ─── Projets ───────────────────────────────────────────────
// `img` : chemin vers l'image (voir src/assets/ ou une URL https).

export const projects: Project[] = [
  {
    img: project1,
    title: "FinFlow Dashboard",
    category: "SaaS · Analytique",
    desc: "Plateforme de gestion financière avec visualisation de données en temps réel.",
    link: "",
  },
  {
    img: project2,
    title: "Nova Assistant",
    category: "IA · Chatbot",
    desc: "Assistant intelligent pour le service client avec NLP avancé.",
    link: "",
  },
  {
    img: project3,
    title: "PulseMetrics",
    category: "Analyse de Données",
    desc: "Tableau de bord de métriques d'entreprise avec prédictions IA.",
    link: "",
  },
];

// ─── Témoignages ───────────────────────────────────────────

export const testimonials: Testimonial[] = [
  {
    name: "Amina Belkacem",
    role: "PDG, Sonatrach Digital",
    quote:
      "NOVA BNISIT a livré une plateforme IA qui a réduit notre temps de reporting de 80%. Une ingénierie véritablement de classe mondiale.",
  },
  {
    name: "Karim Haddad",
    role: "CTO, TechCorp",
    quote:
      "De la stratégie au lancement, chaque point de contact a été premium. Le meilleur partenaire avec lequel nous avons travaillé ces dernières années.",
  },
  {
    name: "Sara Bouzid",
    role: "Fondatrice, Innovate",
    quote:
      "Leur expertise en design et en IA a transformé notre produit. Les conversions ont été multipliées par 3 en un mois.",
  },
];

// ─── FAQ ───────────────────────────────────────────────────
// Ces entrées alimentent aussi le schema.org FAQPage (SEO Google).

export const faqs: Faq[] = [
  {
    question: "Combien de temps prend un projet typique ?",
    answer:
      "La plupart des projets livrent une première version en 4 à 8 semaines, selon le périmètre et les intégrations nécessaires.",
  },
  {
    question: "Travaillez-vous avec des startups ?",
    answer:
      "Oui. Nous collaborons avec des startups financées et des entreprises établies, en adaptant notre approche à votre stade de développement.",
  },
  {
    question: "Quels modèles d'IA utilisez-vous ?",
    answer:
      "Nous sommes agnostiques en termes de modèles — GPT, Claude, Gemini, open-source — choisis selon le cas d'usage pour la qualité, le coût et la confidentialité.",
  },
  {
    question: "Offrez-vous un support continu ?",
    answer:
      "Absolument. Tous nos projets incluent une fenêtre de support, et nous proposons des contrats de maintenance pour l'optimisation continue.",
  },
  {
    question: "Quel est le budget d'un projet ?",
    answer:
      "Les engagements commencent généralement à 10 000 €. Nous établissons un chiffrage précis lors d'un appel de découverte.",
  },
];

// ─── Navigation ────────────────────────────────────────────

export const navLinks = [
  { label: "Accueil", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "À propos", href: "#about" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;
