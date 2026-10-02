import { submitContactFn } from "@/api/messages";

// ============================================================
//  Envoi du formulaire de contact.
//
//  1. Base de données configurée  → le message est enregistré et
//     visible dans /admin.
//  2. Pas de base de données       → repli sur le logiciel de
//     messagerie du visiteur (mailto:).
//
//  Rien n'est stocké dans le navigateur.
// ============================================================

export type ContactResult = "stored" | "mailto" | "unavailable";

export interface ContactPayload {
  name: string;
  email: string;
  company: string;
  message: string;
  /** Piège à robots : laisser vide. */
  website?: string;
}

function buildMailto(payload: ContactPayload, fallbackEmail: string): string {
  const subject = `Nouveau message depuis NOVA BNISIT — ${payload.name}`;
  const body = [
    `Nom : ${payload.name}`,
    `Email : ${payload.email}`,
    `Entreprise : ${payload.company || "—"}`,
    "",
    payload.message,
  ].join("\n");

  return `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function sendContactMessage(
  payload: ContactPayload,
  fallbackEmail: string,
): Promise<ContactResult> {
  let result: string;
  try {
    result = await submitContactFn({ data: payload });
  } catch (error) {
    // La base est configurée mais tombe : on ne perd pas le message,
    // on ouvre la messagerie du visiteur.
    console.warn(
      "[NOVA BNISIT] Envoi en base impossible, repli mailto:",
      error instanceof Error ? error.message : error,
    );
    window.location.href = buildMailto(payload, fallbackEmail);
    return "mailto";
  }

  if (result === "stored") return "stored";

  if (result === "not_configured") {
    window.location.href = buildMailto(payload, fallbackEmail);
    return "mailto";
  }

  return "unavailable";
}
