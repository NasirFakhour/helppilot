-- Ajout des champs Siret et Adresse au profil technicien
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS siret       TEXT,
ADD COLUMN IF NOT EXISTS adresse     TEXT,
ADD COLUMN IF NOT EXISTS code_postal TEXT,
ADD COLUMN IF NOT EXISTS ville       TEXT;

-- Ajout du Siret aux clients (pour les pros)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS siret TEXT;
