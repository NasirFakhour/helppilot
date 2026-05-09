'use client'

import { updateIntervention, deleteIntervention } from '@/app/(app)/actions'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Calendar, Clock, Euro, Tag, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function EditInterventionPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intervention, setIntervention] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      
      const [invRes, cliRes] = await Promise.all([
        supabase.from('interventions').select('*').eq('id', id).single(),
        supabase.from('clients').select('id, nom, prenom').order('nom', { ascending: true })
      ])

      if (invRes.data) setIntervention(invRes.data)
      else setError('Intervention introuvable')
      
      if (cliRes.data) setClients(cliRes.data)
      
      setInitialLoading(false)
    }
    loadData()
  }, [id])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await updateIntervention(id, formData)
    if (result?.error) {
      toast.error(result.error)
      setError(result.error)
    } else {
      toast.success('Intervention mise à jour')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (confirm("Voulez-vous vraiment supprimer cette intervention ?")) {
      await deleteIntervention(id)
      toast.success('Intervention supprimée')
      router.push('/interventions')
    }
  }

  if (initialLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
        <div className="h-10 bg-[var(--color-border)] rounded w-1/3 mb-8"></div>
        <div className="card h-96"></div>
      </div>
    )
  }

  if (!intervention) return <div className="p-8 text-center text-red-500">{error}</div>

  const dateValue = intervention.date ? new Date(intervention.date).toISOString().split('T')[0] : ''

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/interventions" className="btn btn-ghost btn-sm -ml-3">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux interventions</span>
        </Link>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Modifier l'intervention</h1>
          <p>Détails de la mission #{intervention.id.slice(0, 8)}</p>
        </div>
        <div className="page-header-actions flex gap-2">
          {intervention.statut === 'terminee' && (
            <Link 
              href={`/documents/new?type=facture&client_id=${intervention.client_id}&intervention_id=${intervention.id}&desc=${encodeURIComponent(intervention.description)}&amount=${intervention.montant || 0}`}
              className="btn btn-primary"
            >
              Générer une facture
            </Link>
          )}
          <button type="button" onClick={handleDelete} className="btn btn-secondary text-danger border-danger/20 hover:bg-danger-light">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Supprimer</span>
          </button>
        </div>
      </div>

      <form action={handleSubmit} className="card">
        <div className="card-body space-y-8">
          {error && <div className="badge badge-danger p-3 w-full justify-start rounded-lg">{error}</div>}
          
          <div className="section">
            <h4 className="section-title">Informations Générales</h4>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="client_id">Client destinataire *</label>
                <select id="client_id" name="client_id" className="form-control" required defaultValue={intervention.client_id}>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label flex items-center gap-2" htmlFor="date">
                    <Calendar className="w-3 h-3 text-muted" /> Date *
                  </label>
                  <input type="date" id="date" name="date" className="form-control" required defaultValue={dateValue} />
                </div>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2" htmlFor="heure">
                    <Clock className="w-3 h-3 text-muted" /> Heure
                  </label>
                  <input type="time" id="heure" name="heure" className="form-control" defaultValue={intervention.heure || ''} />
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">Détails de la mission</h4>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description courte *</label>
                <input type="text" id="description" name="description" className="form-control" required defaultValue={intervention.description} placeholder="Ex: Remplacement disque dur" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">Notes détaillées</label>
                <textarea id="notes" name="notes" rows={4} className="form-control" defaultValue={intervention.notes || ''} placeholder="Détails techniques, matériel utilisé, points à surveiller..."></textarea>
              </div>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">Facturation et Suivi</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-group">
                <label className="form-label flex items-center gap-2" htmlFor="montant">
                  <Euro className="w-3 h-3 text-muted" /> Montant (€)
                </label>
                <input type="number" step="0.01" id="montant" name="montant" className="form-control" defaultValue={intervention.montant || ''} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-2" htmlFor="statut">
                  <Tag className="w-3 h-3 text-muted" /> Statut
                </label>
                <select id="statut" name="statut" className="form-control" defaultValue={intervention.statut}>
                  <option value="planifiee">À faire</option>
                  <option value="en-cours">En cours</option>
                  <option value="terminee">Terminée</option>
                  <option value="annulee">Annulée</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-2" htmlFor="statut_paiement">
                  <CreditCard className="w-3 h-3 text-muted" /> Paiement
                </label>
                <select id="statut_paiement" name="statut_paiement" className="form-control" defaultValue={intervention.statut_paiement}>
                  <option value="non-paye">Non réglé</option>
                  <option value="en-attente">Relancé</option>
                  <option value="paye">Réglé</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-footer flex justify-end gap-3">
          <Link href="/interventions" className="btn btn-secondary">Annuler</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}

