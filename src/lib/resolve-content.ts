import {
  contact as fallbackContact,
  faqs as fallbackFaqs,
  projects as fallbackProjects,
  services as fallbackServices,
  site,
  testimonials as fallbackTestimonials,
  type Faq,
  type Project,
  type Service,
  type Testimonial,
} from "@/data/site";
import type {
  Content,
  FaqRow,
  ProjectRow,
  ServiceRow,
  SettingsMap,
  TestimonialRow,
} from "@/api/content";

// ============================================================
//  Fusion base de données → src/data/site.ts
//
//  Si une table est vide, absente, ou si la base est injoignable,
//  on retombe automatiquement sur le contenu de site.ts.
//  → Le site ne peut jamais rester vide.
// ============================================================

export interface ContactInfo {
  email: string;
  phone: string;
  phoneRaw: string;
  address: string;
  hours: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
}

export interface ResolvedContent {
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  faqs: Faq[];
  contact: ContactInfo;
  description: string;
  /** true quand au moins une ligne provient de la base de données. */
  fromDatabase: boolean;
}

function pick<T>(rows: T[] | undefined, fallback: T[]): T[] {
  return rows && rows.length > 0 ? rows : fallback;
}

export function resolveContent(
  content: Content | null | undefined,
): ResolvedContent {
  const settings: SettingsMap = content?.settings ?? {};
  const value = (key: string, fallback: string) =>
    settings[key]?.trim() || fallback;

  return {
    services: pick(content?.services?.map(toService), fallbackServices),
    projects: pick(content?.projects?.map(toProject), fallbackProjects),
    testimonials: pick(
      content?.testimonials?.map(toTestimonial),
      fallbackTestimonials,
    ),
    faqs: pick(content?.faqs?.map(toFaq), fallbackFaqs),
    contact: {
      email: value("email", fallbackContact.email),
      phone: value("phone", fallbackContact.phone),
      phoneRaw: value("phone_raw", fallbackContact.phoneRaw),
      address: value("address", fallbackContact.address),
      hours: value("hours", site.hours),
      whatsapp: value("whatsapp", fallbackContact.whatsapp),
      facebook: value("facebook", fallbackContact.facebook),
      instagram: value("instagram", fallbackContact.instagram),
    },
    description: value("site_description", site.description),
    fromDatabase: Boolean(content),
  };
}

function toService(row: ServiceRow): Service {
  return {
    icon: row.icon,
    title: row.title,
    desc: row.description,
    color: row.color,
  };
}

function toProject(row: ProjectRow): Project {
  let gallery: string[] = [];

  if (row.gallery_urls) {
    try {
      const parsed = JSON.parse(row.gallery_urls);
      if (Array.isArray(parsed)) {
        gallery = parsed
          .filter((u) => typeof u === "string" && u.trim().length > 0)
          .map((u) => u.trim());
      }
    } catch {
      gallery = [];
    }
  }

  const cover = row.image_url?.trim() || gallery[0] || undefined;

  if (gallery.length === 0 && cover) {
    gallery = [cover];
  }

  return {
    img: cover,
    title: row.title,
    category: row.category,
    desc: row.description,
    link: row.link_url?.trim() || "",
    type: row.type?.trim() || undefined,
    images: gallery,
  };
}

function toTestimonial(row: TestimonialRow): Testimonial {
  return { name: row.name, role: row.role, quote: row.quote };
}

function toFaq(row: FaqRow): Faq {
  return { question: row.question, answer: row.answer };
}
