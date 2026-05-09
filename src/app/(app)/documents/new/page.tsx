import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DocumentForm } from '@/components/DocumentForm'

export default async function NewDocumentPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const resolvedParams = await searchParams
  const supabase = await createClient()
  
  const { data: clients } = await supabase.from('clients').select('id, nom, prenom').order('nom', { ascending: true })

  const type = resolvedParams.type === 'facture' ? 'facture' : 'devis'

  if (!clients || clients.length === 0) {
    return (
      <div className="card max-w-2xl mx-auto mt-10">
        <div className="empty-state">
          <h2 className="empty-state-title">Aucun client disponible</h2>
          <p className="empty-state-desc">Vous devez d'abord créer un client avant de générer un document.</p>
          <Link href="/clients/new" className="btn btn-primary mt-4">Créer un client</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/documents" className="btn btn-ghost btn-sm -ml-3">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux documents</span>
        </Link>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Nouveau {type}</h1>
          <p>Saisissez les détails de facturation</p>
        </div>
      </div>

      <DocumentForm clients={clients} defaultType={type} />
    </div>
  )
}
