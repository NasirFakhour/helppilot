'use client'

import { updateSettings, updatePassword } from '@/app/(app)/actions'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Save, User, Shield, Info, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setInitialLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await updateSettings(formData)
    if (result?.error) {
      toast.error(result.error)
      setError(result.error)
    } else {
      toast.success('Paramètres enregistrés avec succès')
    }
    setLoading(false)
  }
  async function handlePasswordSubmit(formData: FormData) {
    setPasswordLoading(true)
    const result = await updatePassword(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Mot de passe mis à jour avec succès')
      // Clear inputs
      const form = document.getElementById('password-form') as HTMLFormElement
      if (form) form.reset()
    }
    setPasswordLoading(false)
  }

  if (initialLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
        <div className="h-10 bg-[var(--color-border)] rounded w-1/3 mb-8"></div>
        <div className="card h-96"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Paramètres</h1>
          <p>Gérez votre compte et vos informations professionnelles</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Profil Technicien
            </h3>
          </div>
          <div className="card-body space-y-6">
            {error && <div className="badge badge-danger p-3 w-full justify-start rounded-lg">{error}</div>}
            
            <div className="form-group">
              <label className="form-label">Email de connexion</label>
              <div className="relative">
                <input type="email" className="form-control" value={profile?.email || ''} disabled />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Shield className="w-4 h-4 text-[var(--color-text-muted)]" />
                </div>
              </div>
              <p className="form-hint flex items-center gap-1 mt-1">
                <Info className="w-3 h-3" />
                L'email de connexion est géré par l'administrateur.
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="nom_societe">Nom de la société / Nom commercial *</label>
                <input type="text" id="nom_societe" name="nom_societe" className="form-control" defaultValue={profile?.nom_societe || ''} placeholder="Ex: Informatique Services" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="siret">Numéro de SIRET</label>
                <input type="text" id="siret" name="siret" className="form-control" defaultValue={profile?.siret || ''} placeholder="123 456 789 00012" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="telephone">Téléphone professionnel *</label>
                <input type="tel" id="telephone" name="telephone" className="form-control" defaultValue={profile?.telephone || ''} placeholder="06 00 00 00 00" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="adresse">Adresse du siège / Personnelle *</label>
                <input type="text" id="adresse" name="adresse" className="form-control" defaultValue={profile?.adresse || ''} placeholder="12 rue des Artisans" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="code_postal">Code Postal *</label>
                <input type="text" id="code_postal" name="code_postal" className="form-control" defaultValue={profile?.code_postal || ''} placeholder="69000" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ville">Ville *</label>
                <input type="text" id="ville" name="ville" className="form-control" defaultValue={profile?.ville || ''} placeholder="Lyon" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signature">Signature des documents / Mentions légales</label>
              <textarea id="signature" name="signature" rows={4} className="form-control" defaultValue={profile?.signature || ''} placeholder="Vos informations légales complètes..."></textarea>
              <p className="form-hint">Ces informations apparaîtront au bas de vos rapports et documents.</p>
            </div>
          </div>
          
          <div className="card-footer flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </form>

      <form id="password-form" action={handlePasswordSubmit} className="mt-8">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Sécurité
            </h3>
          </div>
          <div className="card-body space-y-6">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="password">Nouveau mot de passe</label>
                <input type="password" id="password" name="password" className="form-control" placeholder="••••••••" required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <input type="password" id="confirmPassword" name="confirmPassword" className="form-control" placeholder="••••••••" required minLength={6} />
              </div>
            </div>
          </div>
          <div className="card-footer flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
              <Save className="w-4 h-4 mr-2" />
              {passwordLoading ? 'Mise à jour...' : 'Modifier le mot de passe'}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 mb-20">
        <div className="card border-primary/20 bg-primary/[0.02]">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Espace Démonstration
            </h3>
          </div>
          <div className="card-body">
            <p className="text-sm text-muted mb-6">
              Vous préparez une démo ? Vous pouvez peupler votre compte avec des clients, interventions et documents fictifs pour tester toutes les fonctionnalités V1 (Planning, Dashboard, Relances).
            </p>
            <div className="flex justify-center">
              <button 
                onClick={async () => {
                  const { generateDemoData } = await import('@/app/(app)/actions')
                  const res = await generateDemoData()
                  if (res?.error) toast.error(res.error)
                  else {
                    toast.success('Données de démonstration générées !')
                    window.location.href = '/dashboard'
                  }
                }}
                className="btn btn-primary"
              >
                Générer les données de démo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

