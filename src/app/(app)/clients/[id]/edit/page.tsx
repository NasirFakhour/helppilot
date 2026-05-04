'use client'

import { updateClientRecord } from '@/app/(app)/actions'
import Link from 'next/link'
import { ArrowLeft, Save, User, MapPin, Phone, Mail, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState<any>(null)

  useEffect(() => {
    async function loadClient() {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data } = await supabase.from('clients').select('*').eq('id', id).single()
      if (data) setClient(data)
      else setError('Client introuvable')
      setInitialLoading(false)
    }
    loadClient()
  }, [id])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await updateClientRecord(id, formData)
    if (result?.error) {
      toast.error(result.error)
      setError(result.error)
    } else {
      toast.success('Modifications enregistrées avec succès')
      router.push(`/clients/${id}`)
    }
    setLoading(false)
  }

  if (initialLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
        <div className="h-10 bg-[var(--color-border)] rounded w-1/3 mb-8"></div>
        <div className="card h-96"></div>
      </div>
    )
  }

  if (!client) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/clients/${id}`} className="btn btn-ghost btn-sm -ml-3">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au profil</span>
        </Link>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Modifier le client</h1>
          <p>Mise à jour des coordonnées et informations</p>
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
                <input type="text" id="prenom" name="prenom" className="form-control" defaultValue={client.prenom || ''} placeholder="Jean" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="nom">Nom ou Société *</label>
                <input type="text" id="nom" name="nom" className="form-control" required defaultValue={client.nom || ''} placeholder="Dupont" />
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
                <input type="email" id="email" name="email" className="form-control" defaultValue={client.email || ''} placeholder="jean.dupont@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-2" htmlFor="telephone">
                  <Phone className="w-3 h-3 text-muted" /> Téléphone
                </label>
                <input type="tel" id="telephone" name="telephone" className="form-control" defaultValue={client.telephone || ''} placeholder="06 12 34 56 78" />
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
                <input type="text" id="adresse" name="adresse" className="form-control" defaultValue={client.adresse || ''} placeholder="123 rue de la Paix" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="code_postal">Code Postal</label>
                  <input type="text" id="code_postal" name="code_postal" className="form-control" defaultValue={client.code_postal || ''} placeholder="75001" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ville">Ville</label>
                  <input type="text" id="ville" name="ville" className="form-control" defaultValue={client.ville || ''} placeholder="Paris" />
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
              <textarea id="notes" name="notes" rows={4} className="form-control" defaultValue={client.notes || ''} placeholder="Informations complémentaires, préférences client..."></textarea>
            </div>
          </div>
        </div>
        
        <div className="card-footer flex justify-end gap-3">
          <Link href={`/clients/${id}`} className="btn btn-secondary">Annuler</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}

