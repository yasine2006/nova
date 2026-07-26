-- ============================================================
-- NOVA BNISIT — Table "faqs" pour Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS faqs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_sort ON faqs (sort_order);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read_faqs"
  ON faqs FOR SELECT USING (true);

CREATE POLICY "allow_public_insert_faqs"
  ON faqs FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_public_update_faqs"
  ON faqs FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "allow_public_delete_faqs"
  ON faqs FOR DELETE USING (true);

-- Données par défaut
INSERT INTO faqs (question, answer, sort_order) VALUES
  ('Combien de temps prend un projet typique ?', 'La plupart des projets livrent une première version en 4 à 8 semaines, selon le périmètre et les intégrations nécessaires.', 1),
  ('Travaillez-vous avec des startups ?', 'Oui. Nous collaborons avec des startups financées et des entreprises établies, en adaptant notre approche à votre stade de développement.', 2),
  ('Quels modèles d''IA utilisez-vous ?', 'Nous sommes agnostiques en termes de modèles — GPT, Claude, Gemini, open-source — choisis selon le cas d''usage pour la qualité, le coût et la confidentialité.', 3),
  ('Offrez-vous un support continu ?', 'Absolument. Tous nos projets incluent une fenêtre de support, et nous proposons des contrats de maintenance pour l''optimisation continue.', 4),
  ('Quel est le budget d''un projet ?', 'Les engagements commencent généralement à 10 000 €. Nous établissons un chiffrage précis lors d''un appel de découverte.', 5);
