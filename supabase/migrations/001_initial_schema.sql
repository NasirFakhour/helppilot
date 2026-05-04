-- Chaque utilisateur = un technicien indépendant ou une petite entreprise
-- Row Level Security isole les données par user_id

-- 1. Table Profiles
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  nom_societe TEXT,
  telephone   TEXT,
  signature   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Active RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. Table Clients
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nom         TEXT NOT NULL,
  prenom      TEXT,
  email       TEXT,
  telephone   TEXT,
  adresse     TEXT,
  ville       TEXT,
  code_postal TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);


-- 3. Table Interventions
CREATE TABLE interventions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id        UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  date             TIMESTAMPTZ,
  heure            TEXT,
  duree            INTEGER,
  description      TEXT NOT NULL,
  adresse          TEXT,
  montant          DECIMAL(10,2),
  statut           TEXT CHECK (statut IN ('planifiee','en-cours','terminee','annulee')) DEFAULT 'planifiee',
  statut_paiement  TEXT CHECK (statut_paiement IN ('non-paye','en-attente','paye')) DEFAULT 'non-paye',
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interventions" ON interventions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interventions" ON interventions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interventions" ON interventions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interventions" ON interventions
  FOR DELETE USING (auth.uid() = user_id);


-- 4. Function & Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Indexes for performance
CREATE INDEX idx_interventions_user_id ON interventions(user_id);
CREATE INDEX idx_interventions_client_id ON interventions(client_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
