-- ============================================================
-- MIGRATION FINALE : SIRET ET ADRESSES
-- Exécuter ce script dans l'éditeur SQL de votre console Supabase
-- ============================================================

-- 1. Ajout des champs au profil technicien
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS siret       TEXT,
ADD COLUMN IF NOT EXISTS adresse     TEXT,
ADD COLUMN IF NOT EXISTS code_postal TEXT,
ADD COLUMN IF NOT EXISTS ville       TEXT;

-- 2. Ajout du Siret aux clients (pour les factures professionnelles)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS siret TEXT;

-- 3. (Optionnel) Suppression des anciennes colonnes si nécessaire
-- COMMENTÉ pour éviter toute perte de données accidentelle
-- ALTER TABLE profiles DROP COLUMN IF EXISTS help_pilot_id; 

-- Note : Les modifications de code pour rendre ces champs obligatoires 
-- dans l'interface ont déjà été appliquées localement.
