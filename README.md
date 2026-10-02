# NOVA BNISIT — Site vitrine

Site vitrine pour **NOVA BNISIT**, entreprise de solutions numériques et intelligence artificielle.

Site **SSR avec back-end d'administration** : le contenu est stocké en base
(**Vercel Postgres / Neon**) et modifiable sans redéploiement depuis
`/admin`. Aucun contenu en `localStorage` : la session admin vit dans un
cookie `httpOnly` signé, illisible en JavaScript.

## Technologies

- React 19 + TypeScript
- TanStack Start (SSR) + TanStack Router
- **Vercel Postgres (Neon)** — contenu du site
- **Vercel Blob** — images (optionnel)
- Tailwind CSS v4
- Framer Motion (animations)
- Lucide React (icônes)

## Installation

```bash
npm install
```

## Configuration

```bash
cp .env.example .env
```

Puis renseignez :

| Variable | Obligatoire | Rôle |
|---|---|---|
| `DATABASE_URL` | oui | Lien de connexion Neon (serveur uniquement) |
| `SESSION_SECRET` | oui | Signature de la session — 32 caractères minimum |
| `ADMIN_PASSWORD_HASH` | oui | Hash scrypt du mot de passe — `npm run hash-password` |
| `ADMIN_EMAIL` | non | Identifie l'auteur des modifications (empreinte SHA-256) |
| `BLOB_READ_WRITE_TOKEN` | non | Upload d'images. Sans lui : URLs d'images uniquement |
| `VITE_GA_ID` | non | Google Analytics. Vide = désactivé |

### 1. Base de données

Créez un projet sur [Neon](https://console.neon.tech), puis exécutez
[`db/schema.sql`](db/schema.sql) dans le SQL Editor. Le script crée les
tables **et** insère le contenu initial, identique à `src/data/site.ts`.

### 2. Mot de passe admin

```bash
npm run hash-password            # invite
npm run hash-password -- "mon mot de passe"
```

Copiez la ligne `ADMIN_PASSWORD_HASH=…` affichée dans `.env`.

### 3. Variables Vercel

Dans **Settings → Environment Variables**, ajoutez `DATABASE_URL`,
`SESSION_SECRET` et `ADMIN_PASSWORD_HASH`. Ajoutez `BLOB_READ_WRITE_TOKEN`
si vous voulez uploader des images depuis l'admin. Redéployez.

## Développement

```bash
npm run dev      # http://localhost:8080/
```

## Build production

```bash
npm run build    # génère .vercel/output
```

## Administration

- **`/login`** — connexion par mot de passe (5 essais max / 15 min / IP).
- **`/admin`** — tableau de bord : messages, portfolio, services,
  témoignages, FAQ, coordonnées. Réordonner, modifier, supprimer.
- Les écritures passent par des *server functions* qui appellent
  `requireAdmin()` **avant** toute requête SQL. Sans session valide,
  l'appel est rejeté — le client n'a aucun accès direct à la base.

## Comportement sans base de données

Le site reste fonctionnel même si `DATABASE_URL` est absent ou injoignable :
il se replie automatiquement sur `src/data/site.ts`, et le formulaire de
contact bascule sur `mailto:`. L'admin affiche alors un avertissement.

C'est aussi le moyen de modifier le contenu **sans** base : éditez
`src/data/site.ts` puis redéployez.

## Structure du projet

```
db/schema.sql     → tables + contenu initial (Neon)
scripts/
  hash-password.mjs → génère ADMIN_PASSWORD_HASH
src/
  api/            → backend serveur (jamais exposé au client)
    auth.ts         mot de passe scrypt, sessions, rate limiting
    session.ts      cookie httpOnly signé
    db.ts           client Neon + gestion des pannes
    content.ts      lecture publique + CRUD admin
    messages.ts     messages de contact + statistiques
    upload.ts       images (Vercel Blob) ou URL
  data/site.ts    → contenu de repli (et source du seed SQL)
  lib/
    contact.ts     → envoi du formulaire (DB, sinon mailto:)
    resolve-content.ts → DB → repli site.ts
  routes/
    index.tsx      → landing page
    admin.tsx      → tableau de bord (protégé)
    login.tsx      → connexion (protégé)
    mentions-legales.tsx
```

## Sécurité

- Aucun secret exposé au navigateur : les variables `VITE_*` sont les seules
  accessibles au client, et aucune ne contient de donnée sensible.
- Mot de passe stocké en **scrypt** avec sel aléatoire, comparaison en temps
  constant (`timingSafeEqual`).
- Session : cookie `httpOnly`, `sameSite=lax`, `secure` en production,
  signé avec `SESSION_SECRET`. Une faille XSS ne peut pas voler la session.
- Écritures SQL exclusivement via des paramètres préparés.
- `SESSION_SECRET` manquant en production → le serveur **refuse de démarrer**
  plutôt que d'utiliser une clé par défaut.