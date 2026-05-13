-- Mise à jour des statuts d'intervention
ALTER TABLE interventions DROP CONSTRAINT IF EXISTS interventions_statut_check;
ALTER TABLE interventions ADD CONSTRAINT interventions_statut_check 
  CHECK (statut IN ('a-planifier', 'planifiee', 'en-cours', 'terminee', 'facturee', 'annulee'));

-- Ajout de la priorité
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS priorite TEXT CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')) DEFAULT 'normale';

-- Champs pour la fiche intervention enrichie
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS notes_technicien TEXT;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS materiel JSONB DEFAULT '[]'::jsonb;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS signature_client TEXT;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS historique JSONB DEFAULT '[]'::jsonb;

-- Ajout d'index pour le planning
CREATE INDEX IF NOT EXISTS idx_interventions_date ON interventions(date);

-- Ajout d'une colonne pour le portail client (token d'accès public)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_public_token ON clients(public_token);
