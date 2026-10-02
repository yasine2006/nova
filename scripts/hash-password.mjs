#!/usr/bin/env node
/**
 * Génère le hash scrypt du mot de passe admin.
 *
 *   npm run hash-password
 *   npm run hash-password -- "mon mot de passe"
 *
 * Affiche la ligne à copier dans ADMIN_PASSWORD_HASH (.env local
 * ou variables d'environnement Vercel). Le mot de passe n'est jamais
 * écrit sur le disque ni journalisé.
 */
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

function hashPassword(password, salt) {
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const fromArgs = process.argv[2];
const answer =
  fromArgs ??
  (await createInterface({ input, output }).question("Mot de passe admin : ", {
    hideEchoBack: true,
  }));
const password = answer.trim();

if (!password) {
  console.error("\n❌ Mot de passe vide : rien à hasher.");
  process.exit(1);
}

if (password.length < 8) {
  console.error(
    "\n⚠️  Moins de 8 caractères — un mot de passe aussi court est trivial à deviner.",
  );
}

const salt = randomBytes(16).toString("hex");
console.log(
  "\n✅ Hash scrypt généré — copiez cette ligne dans .env (et dans les variables Vercel) :\n",
);
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password, salt)}\n`);
console.log(
  "⚠️  Ne committez jamais ce hash dans un dépôt public : il remplace le mot de passe en clair.",
);
