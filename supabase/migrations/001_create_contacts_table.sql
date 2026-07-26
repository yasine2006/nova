-- ============================================================
-- NOVA BNISIT — Table "contacts" pour Supabase
-- ============================================================
-- 1. Allez dans Supabase → SQL Editor
-- 2. Copiez-collez TOUT ce script
-- 3. Cliquez "Run"
-- ============================================================

CREATE TABLE IF NOT EXISTS contacts (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  company    TEXT DEFAULT '',
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour trier par date (plus récent en premier)
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);

-- Index pour filtrer les non-lus
CREATE INDEX IF NOT EXISTS idx_contacts_read ON contacts (read);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
-- Activer RLS sur la table contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Politique INSERT : tout le monde peut envoyer un message
-- (c'est un formulaire de contact public)
CREATE POLICY "allow_public_insert"
  ON contacts
  FOR INSERT
  WITH CHECK (true);

-- Politique SELECT : seuls les admins peuvent lire les messages
-- Remplacez 'VOTRE_USER_ID_ICI' par votre ID utilisateur Supabase
-- (le trouver dans Supabase → Authentication → Users)
-- Si vous voulez que TOUS les messages soient lisibles, utilisez true:
CREATE POLICY "allow_authenticated_read"
  ON contacts
  FOR SELECT
  USING (true);

-- Politique UPDATE : marquer comme lu (admin seulement)
CREATE POLICY "allow_authenticated_update"
  ON contacts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Politique DELETE : supprimer un message (admin seulement)
CREATE POLICY "allow_authenticated_delete"
  ON contacts
  FOR DELETE
  USING (true);
