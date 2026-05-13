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

export type InterventionStatut = 'a-planifier' | 'planifiee' | 'en-cours' | 'terminee' | 'facturee' | 'annulee'
export type InterventionPriorite = 'basse' | 'normale' | 'haute' | 'urgente'
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
  priorite: InterventionPriorite
  statut_paiement: PaiementStatut
  notes?: string | null
  notes_technicien?: string | null
  materiel?: any[] | null
  photos?: any[] | null
  signature_client?: string | null
  historique?: any[] | null
  created_at: string
  updated_at: string
  
  // Joined relation for UI convenience
  clients?: Client | null
}

export interface Document {
  id: string
  user_id: string
  client_id: string
  intervention_id?: string | null
  type: 'devis' | 'facture'
  numero: string
  date_emission: string
  date_echeance?: string | null
  statut: string
  total_ht: number
  tva_taux: number
  total_ttc: number
  notes?: string | null
  created_at: string
  updated_at: string
  
  // Joins
  clients?: Client | null
  document_lignes?: DocumentLine[]
}

export interface DocumentLine {
  id: string
  document_id: string
  description: string
  quantite: number
  prix_unitaire_ht: number
  total_ht: number
  ordre: number
}
