import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { InterventionForm } from '@/components/InterventionForm'

export default async function NewInterventionPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  
  const { data: clients } = await supabase.from('clients').select('id, nom, prenom').order('nom', { ascending: true })

  if (!clients || clients.length === 0) {
    return (
      <div className="card max-w-2xl mx-auto mt-10">
        <div className="empty-state">
          <h2 className="empty-state-title">Aucun client disponible</h2>
          <p className="empty-state-desc">Vous devez d'abord créer un client avant de planifier une intervention.</p>
          <Link href="/clients/new" className="btn btn-primary mt-4">Créer un client</Link>
        </div>
      </div>
    )
  }

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
          <h1>Nouvelle Intervention</h1>
          <p>Planifiez une nouvelle mission pour vos clients</p>
        </div>
      </div>

      <InterventionForm clients={clients} defaultClient={resolvedSearchParams.client || ''} />
    </div>
  )
}

