'use client'

import { createClientRecord } from '@/app/(app)/actions'
import Link from 'next/link'
import { ArrowLeft, Save, User, MapPin, Phone, Mail, FileText } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function NewClientPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createClientRecord(formData)
    if (result?.error) {
      toast.error(result.error)
      setError(result.error)
    } else {
      toast.success('Client enregistré avec succès')
    }
    setLoading(false)
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/clients" className="btn btn-ghost btn-sm -ml-3">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux clients</span>
        </Link>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Nouveau Client</h1>
          <p>Ajoutez un nouveau client à votre carnet d'adresses</p>
        </div>
      </div>

      <form action={handleSubmit} className="card">
        <div className="card-body space-y-8">
          {error && <div className="badge badge-danger p-3 w-full justify-start rounded-lg">{error}</div>}
          
          <div className="section">
            <h4 className="section-title">Identité</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="prenom">Prénom</label>
                <input type="text" id="prenom" name="prenom" className="form-control" placeholder="Jean" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="nom">Nom ou Société *</label>
                <input type="text" id="nom" name="nom" className="form-control" required placeholder="Dupont" />
              </div>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">Contact</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label flex items-center gap-2" htmlFor="email">
                  <Mail className="w-3 h-3 text-muted" /> Email
                </label>
                <input type="email" id="email" name="email" className="form-control" placeholder="jean.dupont@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-2" htmlFor="telephone">
                  <Phone className="w-3 h-3 text-muted" /> Téléphone
                </label>
                <input type="tel" id="telephone" name="telephone" className="form-control" placeholder="06 12 34 56 78" />
              </div>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">Adresse</h4>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label flex items-center gap-2" htmlFor="adresse">
                  <MapPin className="w-3 h-3 text-muted" /> Adresse
                </label>
                <input type="text" id="adresse" name="adresse" className="form-control" placeholder="123 rue de la Paix" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="code_postal">Code Postal</label>
                  <input type="text" id="code_postal" name="code_postal" className="form-control" placeholder="75001" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ville">Ville</label>
                  <input type="text" id="ville" name="ville" className="form-control" placeholder="Paris" />
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">Notes</h4>
            <div className="form-group">
              <label className="form-label flex items-center gap-2" htmlFor="notes">
                <FileText className="w-3 h-3 text-muted" /> Notes internes
              </label>
              <textarea id="notes" name="notes" rows={4} className="form-control" placeholder="Informations complémentaires, préférences client..."></textarea>
            </div>
          </div>
        </div>
        
        <div className="card-footer flex justify-end gap-3">
          <Link href="/clients" className="btn btn-secondary">Annuler</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer le client'}
          </button>
        </div>
      </form>
    </div>
  )
}

