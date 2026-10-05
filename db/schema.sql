-- ============================================================
--  NOVA BNISIT — Schéma Postgres (Neon)
--
--  Exécution :
--    1. Créer la base dans Vercel → Storage → Neon (ou Neon Console)
--    2. Copier DATABASE_URL dans les variables d'environnement Vercel
--    3. Coller ce fichier dans le SQL Editor de Neon, puis Run
--
--  Ou en ligne de commande :
--    psql "$DATABASE_URL" -f db/schema.sql
-- ============================================================

-- ─── Projets du portfolio ──────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  link_url    TEXT NOT NULL DEFAULT '',
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects (sort_order, id);

-- ─── Projets : type + galerie (aperçu site vs galerie d'images) ───
-- `type`         : website | webapp | graphic | branding | design | other
-- `gallery_urls` : JSON array d'URLs ["https://…","https://…"]
ALTER TABLE projects ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'website';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_urls TEXT;

-- ─── Services ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'Code2',
  color       TEXT NOT NULL DEFAULT '#2563EB',
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_services_sort ON services (sort_order, id);

-- ─── Témoignages ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT '',
  quote       TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON testimonials (sort_order, id);

-- ─── FAQ ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faqs_sort ON faqs (sort_order, id);

-- ─── Messages du formulaire de contact ─────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  company     TEXT NOT NULL DEFAULT '',
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts (created_at DESC);

-- ─── Réglages (coordonnées, réseaux sociaux, SEO) ──────────
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--  Données initiales — identiques à src/data/site.ts
--  Re-exécutable : n'insère que si la table est vide.
-- ============================================================

INSERT INTO projects (title, category, description, image_url, link_url, sort_order)
SELECT * FROM (VALUES
  ('FinFlow Dashboard', 'SaaS · Analytique', 'Plateforme de gestion financière avec visualisation de données en temps réel.', '', '', 1),
  ('Nova Assistant', 'IA · Chatbot', 'Assistant intelligent pour le service client avec NLP avancé.', '', '', 2),
  ('PulseMetrics', 'Analyse de Données', 'Tableau de bord de métriques d''entreprise avec prédictions IA.', '', '', 3)
) AS v(title, category, description, image_url, link_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM projects);

INSERT INTO services (title, description, icon, color, sort_order)
SELECT * FROM (VALUES
  ('Développement Web', 'Sites et applications web modernes, optimisés pour la rapidité, le SEO et la conversion.', 'Code2', '#2563EB', 1),
  ('Intelligence Artificielle', 'Systèmes d''IA sur mesure : chatbots, recommandation, prédiction et automatisation intelligente.', 'Brain', '#38BDF8', 2),
  ('Analyse de Données', 'Tableaux de bord, rapports automatisés et insights stratégiques pour piloter vos décisions.', 'BarChart3', '#60A5FA', 3),
  ('Automatisation', 'Automatisez vos processus métiers, réduisez les erreurs et libérez du temps pour l''essentiel.', 'Zap', '#38BDF8', 4)
) AS v(title, description, icon, color, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM services);

INSERT INTO testimonials (name, role, quote, sort_order)
SELECT * FROM (VALUES
  ('Amina Belkacem', 'PDG, Sonatrach Digital', 'NOVA BNISIT a livré une plateforme IA qui a réduit notre temps de reporting de 80%. Une ingénierie véritablement de classe mondiale.', 1),
  ('Karim Haddad', 'CTO, TechCorp', 'De la stratégie au lancement, chaque point de contact a été premium. Le meilleur partenaire avec lequel nous avons travaillé ces dernières années.', 2),
  ('Sara Bouzid', 'Fondatrice, Innovate', 'Leur expertise en design et en IA a transformé notre produit. Les conversions ont été multipliées par 3 en un mois.', 3)
) AS v(name, role, quote, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM testimonials);

INSERT INTO faqs (question, answer, sort_order)
SELECT * FROM (VALUES
  ('Combien de temps prend un projet typique ?', 'La plupart des projets livrent une première version en 4 à 8 semaines, selon le périmètre et les intégrations nécessaires.', 1),
  ('Travaillez-vous avec des startups ?', 'Oui. Nous collaborons avec des startups financées et des entreprises établies, en adaptant notre approche à votre stade de développement.', 2),
  ('Quels modèles d''IA utilisez-vous ?', 'Nous sommes agnostiques en termes de modèles — GPT, Claude, Gemini, open-source — choisis selon le cas d''usage pour la qualité, le coût et la confidentialité.', 3),
  ('Offrez-vous un support continu ?', 'Absolument. Tous nos projets incluent une fenêtre de support, et nous proposons des contrats de maintenance pour l''optimisation continue.', 4),
  ('Quel est le budget d''un projet ?', 'Les engagements commencent généralement à 10 000 €. Nous établissons un chiffrage précis lors d''un appel de découverte.', 5)
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM faqs);

INSERT INTO settings (key, value)
SELECT * FROM (VALUES
  ('email',           'novabnisit@gmail.com'),
  ('phone',           '+212 6 13 61 26 18'),
  ('phone_raw',       '+212613612618'),
  ('address',         'Khenifra, Maroc'),
  ('hours',           'Lun – Ven · 9h00 – 19h00'),
  ('whatsapp',        'https://wa.me/212613612618'),
  ('facebook',        'https://www.facebook.com/profile.php?id=61589333708080'),
  ('instagram',       'https://www.instagram.com/novabnisit.agency/'),
  ('site_description','Solutions numériques et IA premium, conçues pour les entreprises qui exigent l''excellence.')
) AS v(key, value)
ON CONFLICT (key) DO NOTHING;