export interface Profile {
  id: string
  email: string
  nom_societe?: string | null
  telephone?: string | null
  signature?: string | null
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  nom: string
  prenom?: string | null
  email?: string | null
  telephone?: string | null
  adresse?: string | null
  ville?: string | null
  code_postal?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export type InterventionStatut = 'planifiee' | 'en-cours' | 'terminee' | 'annulee'
export type PaiementStatut = 'non-paye' | 'en-attente' | 'paye'

export interface Intervention {
  id: string
  user_id: string
  client_id: string
  date: string
  heure?: string | null
  duree?: number | null
  description: string
  adresse?: string | null
  montant?: number | null
  statut: InterventionStatut
  statut_paiement: PaiementStatut
  notes?: string | null
  created_at: string
  updated_at: string
  
  // Joined relation for UI convenience
  clients?: Client | null
}
