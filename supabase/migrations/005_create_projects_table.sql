-- ============================================================
-- NOVA BNISIT — Table "projects" pour Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url   TEXT DEFAULT '',
  link_url    TEXT DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects (sort_order);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON projects FOR ALL USING (true) WITH CHECK (true);

-- Données par défaut
INSERT INTO projects (title, category, description, image_url, sort_order) VALUES
  ('FinFlow Dashboard', 'SaaS · Analytique', 'Plateforme de gestion financière avec visualisation de données en temps réel.', '', 1),
  ('Nova Assistant', 'IA · Chatbot', 'Assistant intelligent pour le service client avec NLP avancé.', '', 2),
  ('PulseMetrics', 'Analyse de Données', 'Tableau de bord de métriques d''entreprise avec prédictions IA.', '', 3);
