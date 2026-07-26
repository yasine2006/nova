-- ============================================================
-- NOVA BNISIT — Table "testimonials" pour Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL,
  quote       TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON testimonials (sort_order);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read_testimonials"
  ON testimonials FOR SELECT USING (true);

CREATE POLICY "allow_public_insert_testimonials"
  ON testimonials FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_public_update_testimonials"
  ON testimonials FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "allow_public_delete_testimonials"
  ON testimonials FOR DELETE USING (true);

-- Données par défaut
INSERT INTO testimonials (name, role, quote, sort_order) VALUES
  ('Amina Belkacem', 'PDG, Sonatrach Digital', 'NOVA BNISIT a livré une plateforme IA qui a réduit notre temps de reporting de 80%. Une ingénierie véritablement de classe mondiale.', 1),
  ('Karim Haddad', 'CTO, TechCorp', 'De la stratégie au lancement, chaque point de contact a été premium. Le meilleur partenaire avec lequel nous avons travaillé ces dernières années.', 2),
  ('Sara Bouzid', 'Fondatrice, Innovate', 'Leur expertise en design et en IA a transformé notre produit. Les conversions ont été multipliées par 3 en un mois.', 3);
