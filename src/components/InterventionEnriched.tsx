'use client'

import React, { useState } from 'react'
import { 
  Save, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  X, 
  Camera, 
  PenTool, 
  History, 
  Package, 
  MessageSquare,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { updateIntervention, deleteIntervention, closeIntervention, convertToInvoice } from '@/app/(app)/actions'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface InterventionEnrichedProps {
  intervention: any
  clients: any[]
}

export function InterventionEnriched({ intervention: initialIv, clients }: InterventionEnrichedProps) {
  const router = useRouter()
  const [iv, setIv] = useState(initialIv)
  const [loading, setLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  
  // States for dynamic fields
  const [materiel, setMateriel] = useState<any[]>(iv.materiel || [])
  const [notesTech, setNotesTech] = useState(iv.notes_technicien || '')
  const [newPart, setNewPart] = useState({ name: '', price: '' })

  const handleAddPart = () => {
    if (!newPart.name) return
    setMateriel([...materiel, { ...newPart, price: parseFloat(newPart.price) || 0, id: Date.now() }])
    setNewPart({ name: '', price: '' })
  }

  const handleRemovePart = (id: number) => {
    setMateriel(materiel.filter(p => p.id !== id))
  }

  async function onSave(formData: FormData) {
    setLoading(true)
    formData.append('materiel', JSON.stringify(materiel))
    formData.append('notes_technicien', notesTech)
    
    const res = await updateIntervention(iv.id, formData)
    if (res?.error) toast.error(res.error)
    else toast.success('Mise à jour réussie')
    setLoading(false)
  }

  async function handleClose() {
    setLoading(true)
    const res = await closeIntervention(iv.id, notesTech, materiel)
    if (res?.error) toast.error(res.error)
    else {
      toast.success('Intervention clôturée')
      setIsClosing(false)
      window.location.reload()
    }
    setLoading(false)
  }

  async function handleInvoice() {
    setLoading(true)
    const res = await convertToInvoice(iv.id)
    if (res?.error) toast.error(res.error)
    else {
      toast.success('Facture générée !')
      router.push(`/documents/${res.invoiceId}`)
    }
    setLoading(false)
  }

  const statusColors: any = {
    'a-planifier': 'neutral',
    'planifiee': 'primary',
    'en-cours': 'warning',
    'terminee': 'success',
    'facturee': 'info',
    'annulee': 'danger'
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-3.5 h-3.5 rounded-full bg-[var(--color-${statusColors[iv.statut] || 'primary'})] ring-4 ring-[var(--color-${statusColors[iv.statut] || 'primary'}-light)]`}></div>
          <div>
            <span className="block text-[10px] font-bold text-muted uppercase tracking-widest leading-none mb-1">Statut actuel</span>
            <span className="font-bold text-sm capitalize">{iv.statut}</span>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {iv.statut !== 'terminee' && iv.statut !== 'facturee' && (
            <button 
              onClick={() => setIsClosing(true)}
              className="btn btn-success btn-sm flex-1 sm:flex-none shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Clôturer la mission
            </button>
          )}
          {iv.statut === 'terminee' && (
            <button 
              onClick={handleInvoice}
              className="btn btn-primary btn-sm flex-1 sm:flex-none shadow-glow"
              disabled={loading}
            >
              <Package className="w-4 h-4 mr-2" />
              Générer la facture
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Form */}
          <form action={onSave} className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Détails de l'intervention
              </h3>
            </div>
            <div className="card-body space-y-6">
              <div className="form-group">
                <label className="form-label">Client</label>
                <select name="client_id" className="form-control" defaultValue={iv.client_id}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" name="date" className="form-control" defaultValue={iv.date?.split('T')[0]} />
                </div>
                <div className="form-group">
                  <label className="form-label">Heure</label>
                  <input type="time" name="heure" className="form-control" defaultValue={iv.heure} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description du problème / Mission</label>
                <input type="text" name="description" className="form-control font-bold" defaultValue={iv.description} />
              </div>

              <div className="form-group">
                <label className="form-label">Priorité</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['basse', 'normale', 'haute', 'urgente'].map(p => (
                    <label key={p} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${iv.priorite === p ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] font-bold' : 'border-[var(--color-border)] hover:bg-[var(--color-surface)]'}`}>
                      <input type="radio" name="priorite" value={p} defaultChecked={iv.priorite === p} className="hidden" />
                      <span className="text-[11px] uppercase tracking-wider">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-footer flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>

          {/* Technician Notes & Materials */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <PenTool className="w-4 h-4 text-primary" />
                Compte-rendu terrain
              </h3>
            </div>
            <div className="card-body space-y-8">
              <div className="form-group">
                <label className="form-label">Notes du technicien (Visible sur facture)</label>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  placeholder="Expliquez ce qui a été fait..."
                  value={notesTech}
                  onChange={(e) => setNotesTech(e.target.value)}
                ></textarea>
              </div>

              <div className="space-y-4">
                <label className="form-label flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Pièces & Matériel utilisé
                </label>
                <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)]">
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder="Nom de la pièce" 
                      className="form-control flex-1"
                      value={newPart.name}
                      onChange={(e) => setNewPart({...newPart, name: e.target.value})}
                    />
                    <input 
                      type="number" 
                      placeholder="Prix €" 
                      className="form-control w-24"
                      value={newPart.price}
                      onChange={(e) => setNewPart({...newPart, price: e.target.value})}
                    />
                    <button type="button" onClick={handleAddPart} className="btn btn-secondary">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {materiel.length > 0 ? materiel.map((p) => (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-[var(--color-card)] rounded-xl border border-[var(--color-border-light)]">
                        <span className="font-bold">{p.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-black">{formatCurrency(p.price)}</span>
                          <button onClick={() => handleRemovePart(p.id)} className="text-danger p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-center text-muted py-4">Aucun matériel ajouté.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mobile Quick Actions Card */}
          <div className="card bg-[var(--color-brand)] text-white border-none shadow-lg shadow-[var(--color-accent-glow)]">
            <div className="card-body p-6 space-y-4">
              <h4 className="font-bold text-lg">Actions terrain</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10 group">
                  <Camera className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Photos</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10 group">
                  <PenTool className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Signature</span>
                </button>
              </div>
            </div>
          </div>

          {/* History / Audit Trail */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <History className="w-4 h-4" />
                Historique
              </h3>
            </div>
            <div className="card-body p-0 max-h-[300px] overflow-auto">
              <div className="p-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-bold">Création de la mission</p>
                    <p className="text-[10px] text-muted">Aujourd'hui, 10:45</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Closing Modal Overlay */}
      {isClosing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg shadow-2xl animate-scale-up">
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title">Clôturer l'intervention</h3>
              <button onClick={() => setIsClosing(false)} className="p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="card-body space-y-6">
              <div className="p-4 bg-[var(--color-warning-light)] rounded-2xl border border-[var(--color-warning)]/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0" />
                <p className="text-sm text-secondary">
                  Vérifiez vos notes techniques et le matériel utilisé avant de valider définitivement.
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Notes de clôture</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  value={notesTech} 
                  onChange={(e) => setNotesTech(e.target.value)}
                ></textarea>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted uppercase">Résumé financier</p>
                <div className="flex justify-between items-center p-3 bg-[var(--color-surface)] rounded-xl">
                  <span>Prestation</span>
                  <span className="font-bold">{formatCurrency(iv.montant)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[var(--color-surface)] rounded-xl">
                  <span>Matériel total</span>
                  <span className="font-bold">{formatCurrency(materiel.reduce((acc, p) => acc + p.price, 0))}</span>
                </div>
              </div>
            </div>
            <div className="card-footer flex justify-end gap-3">
              <button onClick={() => setIsClosing(false)} className="btn btn-ghost">Annuler</button>
              <button onClick={handleClose} className="btn btn-success" disabled={loading}>
                {loading ? 'Validation...' : 'Valider & Clôturer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
