-- 6. Table Documents (Devis et Factures)
CREATE TABLE documents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id        UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  intervention_id  UUID REFERENCES interventions(id) ON DELETE SET NULL,
  type             TEXT CHECK (type IN ('devis', 'facture')) NOT NULL,
  numero           TEXT NOT NULL,
  date_emission    TIMESTAMPTZ DEFAULT NOW(),
  date_echeance    TIMESTAMPTZ,
  statut           TEXT NOT NULL,
  total_ht         DECIMAL(10,2) DEFAULT 0,
  tva_taux         DECIMAL(5,2) DEFAULT 0,
  total_ttc        DECIMAL(10,2) DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, numero) -- Ensures no duplicate document numbers for a single user
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- 7. Table Document Lignes (Prestations dans un document)
CREATE TABLE document_lignes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id      UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  description      TEXT NOT NULL,
  quantite         DECIMAL(10,2) DEFAULT 1,
  prix_unitaire_ht DECIMAL(10,2) DEFAULT 0,
  total_ht         DECIMAL(10,2) DEFAULT 0,
  ordre            INTEGER DEFAULT 0
);

ALTER TABLE document_lignes ENABLE ROW LEVEL SECURITY;

-- Note: document_lignes policies usually check the parent document's user_id, 
-- but since Supabase doesn't easily support joins in RLS without performance hits, 
-- we can denormalize user_id or use a subquery. Subquery is safer here.
CREATE POLICY "Users can view own document lignes" ON document_lignes 
  FOR SELECT USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can insert own document lignes" ON document_lignes 
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can update own document lignes" ON document_lignes 
  FOR UPDATE USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can delete own document lignes" ON document_lignes 
  FOR DELETE USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.user_id = auth.uid()));

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_document_lignes_document_id ON document_lignes(document_id);
