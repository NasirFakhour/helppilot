'use client'

import { createDocument } from '@/app/(app)/documents/actions'
import Link from 'next/link'
import { Save, Plus, Trash2 } from 'lucide-react'
import { fullName } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface LineItem {
  id: string
  description: string
  quantite: number
  prix_unitaire_ht: number
}

export function DocumentForm({ 
  clients, 
  defaultType = 'devis',
  defaultClientId = '',
  defaultInterventionId,
  defaultLine
}: { 
  clients: any[], 
  defaultType?: string,
  defaultClientId?: string,
  defaultInterventionId?: string,
  defaultLine?: { description: string, prix_unitaire_ht: number }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState(defaultType)
  
  const [lines, setLines] = useState<LineItem[]>([
    { 
      id: '1', 
      description: defaultLine?.description || '', 
      quantite: 1, 
      prix_unitaire_ht: defaultLine?.prix_unitaire_ht || 0 
    }
  ])
  const [tvaTaux, setTvaTaux] = useState(0)

  const today = new Date().toISOString().split('T')[0]
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const defaultDueDate = nextMonth.toISOString().split('T')[0]

  const totals = useMemo(() => {
    const totalHt = lines.reduce((acc, line) => acc + (line.quantite * line.prix_unitaire_ht), 0)
    const tva = totalHt * (tvaTaux / 100)
    const totalTtc = totalHt + tva
    return { totalHt, tva, totalTtc }
  }, [lines, tvaTaux])

  const addLine = () => {
    setLines([...lines, { id: Math.random().toString(), description: '', quantite: 1, prix_unitaire_ht: 0 }])
  }

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(l => l.id !== id))
    }
  }

  const updateLine = (id: string, field: keyof LineItem, value: any) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    // Check if lines are valid
    if (lines.some(l => !l.description.trim())) {
      setError("Veuillez remplir la description de toutes les lignes.")
      setLoading(false)
      return
    }

    const docData = {
      client_id: formData.get('client_id'),
      intervention_id: formData.get('intervention_id'),
      type: type,
      date_emission: formData.get('date_emission'),
      date_echeance: formData.get('date_echeance'),
      statut: formData.get('statut'),
      notes: formData.get('notes'),
      total_ht: totals.totalHt,
      tva_taux: tvaTaux,
      total_ttc: totals.totalTtc,
    }

    const docLines = lines.map(l => ({
      description: l.description,
      quantite: l.quantite,
      prix_unitaire_ht: l.prix_unitaire_ht,
      total_ht: l.quantite * l.prix_unitaire_ht
    }))

    const result = await createDocument(docData, docLines)
    
    if (result?.error) {
      toast.error(result.error)
      setError(result.error)
      setLoading(false)
    } else {
      toast.success(`${type === 'devis' ? 'Devis' : 'Facture'} créé(e) avec succès`)
      router.push(`/documents/${result.document.id}`)
    }
  }

  return (
    <form action={handleSubmit} className="card">
      <div className="card-body space-y-8">
        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Type de document</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="docType" checked={type === 'devis'} onChange={() => setType('devis')} />
                Devis
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="docType" checked={type === 'facture'} onChange={() => setType('facture')} />
                Facture
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="client_id">Client *</label>
            <select id="client_id" name="client_id" className="form-control" required defaultValue={defaultClientId}>
              <option value="" disabled>Sélectionner un client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{fullName(c)}</option>
              ))}
            </select>
          </div>
          
          {defaultInterventionId && (
            <input type="hidden" name="intervention_id" value={defaultInterventionId} />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label" htmlFor="date_emission">Date d'émission *</label>
            <input type="date" id="date_emission" name="date_emission" className="form-control" required defaultValue={today} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="date_echeance">Date d'échéance / validité</label>
            <input type="date" id="date_echeance" name="date_echeance" className="form-control" defaultValue={defaultDueDate} />
          </div>
        </div>

        <div className="section">
          <h4 className="section-title mb-4">Lignes de prestation</h4>
          <div className="space-y-3">
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-[var(--color-surface)] rounded-t-lg text-xs font-bold text-muted uppercase">
              <div className="col-span-6">Description</div>
              <div className="col-span-2">Quantité</div>
              <div className="col-span-2">Prix unitaire HT</div>
              <div className="col-span-2 text-right">Total HT</div>
            </div>
            
            {lines.map((line, index) => (
              <div key={line.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center bg-[var(--color-surface)] p-4 md:p-2 rounded-lg md:bg-transparent">
                <div className="col-span-6 w-full">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Description de la prestation"
                    value={line.description}
                    onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2 w-full flex items-center gap-2">
                  <span className="md:hidden text-sm text-muted w-24">Qté:</span>
                  <input 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    className="form-control" 
                    value={line.quantite}
                    onChange={(e) => updateLine(line.id, 'quantite', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2 w-full flex items-center gap-2">
                  <span className="md:hidden text-sm text-muted w-24">Prix U. HT:</span>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    className="form-control" 
                    value={line.prix_unitaire_ht}
                    onChange={(e) => updateLine(line.id, 'prix_unitaire_ht', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between w-full">
                  <span className="md:hidden text-sm text-muted">Total HT:</span>
                  <span className="font-bold">{(line.quantite * line.prix_unitaire_ht).toFixed(2)} €</span>
                  <button type="button" onClick={() => removeLine(line.id)} className="text-danger p-2 hover:bg-danger/10 rounded" disabled={lines.length === 1}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button type="button" onClick={addLine} className="btn btn-ghost btn-sm mt-4 text-primary">
            <Plus className="w-4 h-4 mr-1" /> Ajouter une ligne
          </button>
        </div>

        <div className="flex justify-end pt-6 border-t border-[var(--color-border-light)]">
          <div className="w-full md:w-1/3 space-y-3">
            <div className="flex justify-between items-center text-muted">
              <span>Total HT</span>
              <span>{totals.totalHt.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted">
                <span>TVA</span>
                <select className="form-control py-1 px-2 h-auto text-sm" value={tvaTaux} onChange={(e) => setTvaTaux(parseFloat(e.target.value))}>
                  <option value="0">0% (Auto-entrepreneur)</option>
                  <option value="5.5">5.5%</option>
                  <option value="10">10%</option>
                  <option value="20">20%</option>
                </select>
              </div>
              <span className="text-muted">{totals.tva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center font-black text-xl pt-2 border-t border-[var(--color-border-light)]">
              <span>Total TTC</span>
              <span className="text-primary">{totals.totalTtc.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[var(--color-border-light)]">
          <div className="form-group">
            <label className="form-label" htmlFor="statut">Statut initial</label>
            <select id="statut" name="statut" className="form-control">
              <option value="brouillon">Brouillon</option>
              <option value="envoye">Envoyé au client</option>
              {type === 'facture' && <option value="paye">Payé</option>}
              {type === 'devis' && <option value="accepte">Accepté</option>}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="notes">Notes / Mentions légales</label>
            <textarea id="notes" name="notes" rows={2} className="form-control" placeholder="Conditions de paiement, RIB..."></textarea>
          </div>
        </div>
      </div>
      
      <div className="card-footer flex justify-end gap-3">
        <Link href="/documents" className="btn btn-ghost">Annuler</Link>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Création...' : `Créer le ${type === 'devis' ? 'devis' : 'facture'}`}
        </button>
      </div>
    </form>
  )
}
