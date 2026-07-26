# NOVA BNISIT — Landing Page

Site vitrine pour **NOVA BNISIT**, entreprise de solutions numériques et intelligence artificielle.

## Technologies

- React 19 + TypeScript
- TanStack Start (SSR)
- Tailwind CSS v4
- Framer Motion (animations)
- Lucide React (icônes)

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:5173/`

## Build production

```bash
npm run build
```

## Structure du projet

```
src/
  routes/
    index.tsx        → Landing page (page principale)
    __root.tsx       → Layout racine + meta tags
  assets/            → Images (robot, projets, etc.)
  styles.css         → Styles globaux + animations
  router.tsx         → Configuration du routeur
  start.ts           → Middleware d'erreur serveur
  server.ts          → Wrapper SSR
```

## Personnalisation

- **Textes** : modifier directement dans `src/routes/index.tsx`
- **Couleurs** : variables CSS dans `src/styles.css` (propriétés `--brand`, `--brand-2`)
- **Images** : remplacer les fichiers dans `src/assets/`
