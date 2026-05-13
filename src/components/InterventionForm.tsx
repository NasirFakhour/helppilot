'use client'

import { createIntervention } from '@/app/(app)/actions'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { fullName } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

export function InterventionForm({ clients, defaultClient }: { clients: any[], defaultClient: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createIntervention(formData)
    if (result?.error) {
      toast.error(result.error)
      setError(result.error)
      setLoading(false)
    } else {
      toast.success('Intervention programmée')
    }
  }

  return (
    <form action={handleSubmit} className="card">
      <div className="card-body space-y-6">
        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
        <div className="form-group">
          <label className="form-label" htmlFor="client_id">Client *</label>
          <select id="client_id" name="client_id" className="form-control" required defaultValue={defaultClient}>
            <option value="" disabled>Sélectionner un client...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{fullName(c)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label" htmlFor="date">Date *</label>
            <input type="date" id="date" name="date" className="form-control" required defaultValue={today} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="heure">Heure</label>
            <input type="time" id="heure" name="heure" className="form-control" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description de l'intervention *</label>
          <input type="text" id="description" name="description" className="form-control" required placeholder="Ex: Nettoyage PC, Installation Box..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="form-group">
            <label className="form-label" htmlFor="montant">Montant (€)</label>
            <input type="number" step="0.01" id="montant" name="montant" className="form-control" placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="priorite">Priorité</label>
            <select id="priorite" name="priorite" className="form-control" defaultValue="normale">
              <option value="basse">Basse</option>
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
              <option value="urgente">Urgente 🚨</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="statut">Statut</label>
            <select id="statut" name="statut" className="form-control">
              <option value="a-planifier">À planifier</option>
              <option value="planifiee">Planifiée</option>
              <option value="en-cours">En cours ⚡</option>
              <option value="terminee">Terminée ✅</option>
              <option value="facturee">Facturée 📄</option>
              <option value="annulee">Annulée ❌</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="statut_paiement">Paiement</label>
            <select id="statut_paiement" name="statut_paiement" className="form-control">
              <option value="non-paye">Non réglé</option>
              <option value="en-attente">En attente (Relancé)</option>
              <option value="paye">Payé</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="notes">Notes internes (optionnel)</label>
          <textarea id="notes" name="notes" rows={3} className="form-control" placeholder="Détails techniques, matériel utilisé..."></textarea>
        </div>
      </div>
      
      <div className="card-footer flex justify-end gap-3">
        <Link href="/interventions" className="btn btn-ghost">Annuler</Link>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
