import { createClient } from '@/utils/supabase/server'
import { formatCurrency, formatDate, fullName } from '@/lib/utils'
import Link from 'next/link'
import { FileText, Plus, Search, ChevronRight, FileOutput } from 'lucide-react'

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const activeTab = resolvedSearchParams.type === 'facture' ? 'facture' : 'devis'
  
  const { data: documents } = await supabase
    .from('documents')
    .select('*, clients(*)')
    .eq('type', activeTab)
    .order('created_at', { ascending: false })

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'brouillon': return 'badge-neutral'
      case 'envoye': return 'badge-primary'
      case 'accepte': return 'badge-success'
      case 'paye': return 'badge-success'
      case 'refuse': return 'badge-danger'
      case 'retard': return 'badge-danger'
      default: return 'badge-neutral'
    }
  }

  const getStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      brouillon: 'Brouillon',
      envoye: 'Envoyé',
      accepte: 'Accepté',
      paye: 'Payé',
      refuse: 'Refusé',
      retard: 'En retard'
    }
    return labels[statut] || statut
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Devis & Factures</h1>
          <p>Gérez vos documents commerciaux et votre facturation</p>
        </div>
        <div className="page-header-actions">
          <Link href={`/documents/new?type=${activeTab}`} className="btn btn-primary">
            <Plus className="w-5 h-5" />
            <span>Nouveau {activeTab}</span>
          </Link>
        </div>
      </div>

      <div className="flex border-b border-[var(--color-border-light)] mb-6 gap-6">
        <Link 
          href="/documents?type=devis" 
          className={`pb-3 font-semibold transition-colors ${activeTab === 'devis' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-[var(--color-text)]'}`}
        >
          Devis
        </Link>
        <Link 
          href="/documents?type=facture" 
          className={`pb-3 font-semibold transition-colors ${activeTab === 'facture' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-[var(--color-text)]'}`}
        >
          Factures
        </Link>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FileText /></div>
            <h2 className="empty-state-title">Aucun {activeTab}</h2>
            <p className="empty-state-desc">Vous n'avez pas encore créé de {activeTab}.</p>
            <Link href={`/documents/new?type=${activeTab}`} className="btn btn-primary mt-4">Créer mon premier {activeTab}</Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="divide-y divide-[var(--color-border-light)]">
              {documents.map((doc: any) => (
                <Link key={doc.id} href={`/documents/${doc.id}`} className="flex items-center justify-between p-5 hover:bg-[var(--color-surface)] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] text-primary flex items-center justify-center">
                      <FileOutput className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {doc.numero} 
                        <span className={`badge ${getStatusBadge(doc.statut)} px-2 py-0.5 text-xs`}>
                          {getStatusLabel(doc.statut)}
                        </span>
                      </div>
                      <div className="text-sm text-muted mt-1">
                        {fullName(doc.clients)} — {formatDate(doc.date_emission)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right font-bold text-lg">
                      {formatCurrency(doc.total_ttc)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
