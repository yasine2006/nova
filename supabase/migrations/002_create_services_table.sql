-- ============================================================
-- NOVA BNISIT — Table "services" pour Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'Code2',
  color       TEXT NOT NULL DEFAULT '#2563EB',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_sort ON services (sort_order);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read_services"
  ON services FOR SELECT USING (true);

CREATE POLICY "allow_public_insert_services"
  ON services FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_public_update_services"
  ON services FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "allow_public_delete_services"
  ON services FOR DELETE USING (true);

-- Données par défaut
INSERT INTO services (title, description, icon, color, sort_order) VALUES
  ('Développement Web', 'Sites et applications web modernes, optimisés pour la rapidité, le SEO et la conversion.', 'Code2', '#2563EB', 1),
  ('Intelligence Artificielle', 'Systèmes d''IA sur mesure : chatbots, recommandation, prédiction et automatisation intelligente.', 'Brain', '#38BDF8', 2),
  ('Analyse de Données', 'Tableaux de bord, rapports automatisés et insights stratégiques pour piloter vos décisions.', 'BarChart3', '#60A5FA', 3),
  ('Automatisation', 'Automatisez vos processus métiers, réduisez les erreurs et libérez du temps pour l''essentiel.', 'Zap', '#38BDF8', 4);
