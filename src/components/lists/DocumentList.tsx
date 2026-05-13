'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search, ChevronRight, FileOutput } from 'lucide-react'
import { formatCurrency, formatDate, fullName } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'

export function DocumentList({ initialDocuments, defaultTab }: { initialDocuments: any[], defaultTab: string }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')

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

  const filteredDocuments = useMemo(() => {
    let result = initialDocuments

    if (filterStatut !== 'all') {
      result = result.filter(d => d.statut === filterStatut)
    }

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(d => {
        const num = (d.numero || '').toLowerCase()
        const clientName = fullName(d.clients).toLowerCase()
        return num.includes(query) || clientName.includes(query)
      })
    }

    return result
  }, [initialDocuments, search, filterStatut])

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Devis & Factures</h1>
          <p>Gérez vos documents commerciaux et votre facturation</p>
        </div>
        <div className="page-header-actions">
          <Link href={`/documents/new?type=${defaultTab}`} className="btn btn-primary">
            <Plus className="w-5 h-5" />
            <span>Nouveau {defaultTab}</span>
          </Link>
        </div>
      </div>

      <div className="tab-bar mb-6">
        <button 
          onClick={() => { router.push('/documents?type=devis'); setFilterStatut('all'); setSearch('') }}
          className={`flex-1 sm:flex-none px-8 py-3 font-bold text-sm border-b-2 transition-all ${defaultTab === 'devis' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-secondary hover:text-[var(--color-text)]'}`}
        >
          Devis
        </button>
        <button 
          onClick={() => { router.push('/documents?type=facture'); setFilterStatut('all'); setSearch('') }}
          className={`flex-1 sm:flex-none px-8 py-3 font-bold text-sm border-b-2 transition-all ${defaultTab === 'facture' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-secondary hover:text-[var(--color-text)]'}`}
        >
          Factures
        </button>
      </div>

      {initialDocuments.length > 0 && (
        <div className="filter-bar mb-6">
          <div className="search-bar w-full max-w-md">
            <Search className="w-4 h-4" />
            <input
              type="search"
              placeholder={`Rechercher un ${defaultTab} (Numéro, Client)...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <select 
            className="form-control w-full sm:w-48 shadow-sm"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="envoye">Envoyé</option>
            {defaultTab === 'facture' ? (
              <>
                <option value="paye">Payé</option>
                <option value="retard">En retard</option>
              </>
            ) : (
              <>
                <option value="accepte">Accepté</option>
                <option value="refuse">Refusé</option>
              </>
            )}
          </select>
        </div>
      )}

      {!initialDocuments || initialDocuments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FileText /></div>
            <h2 className="empty-state-title">Aucun {defaultTab}</h2>
            <p className="empty-state-desc">Vous n'avez pas encore créé de {defaultTab}.</p>
            <Link href={`/documents/new?type=${defaultTab}`} className="btn btn-primary mt-4">Créer mon premier {defaultTab}</Link>
          </div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <Search className="w-12 h-12 text-muted mb-4 opacity-50" />
            <h2 className="text-lg font-bold">Aucun résultat</h2>
            <p className="text-muted mt-2">Aucun {defaultTab} ne correspond à votre recherche.</p>
            <button onClick={() => { setSearch(''); setFilterStatut('all') }} className="btn btn-ghost mt-4">Réinitialiser les filtres</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="card-title">Vos {defaultTab}s</h3>
            {(search || filterStatut !== 'all') && <span className="text-xs text-muted font-medium">{filteredDocuments.length} résultat(s)</span>}
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-[var(--color-border-light)]">
              {filteredDocuments.map((doc: any) => (
                <Link key={doc.id} href={`/documents/${doc.id}`} className="flex items-center justify-between p-5 hover:bg-[var(--color-surface)] transition-all group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-all flex-shrink-0">
                      <FileOutput className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold flex items-center gap-2">
                        <span className="group-hover:text-[var(--color-accent)] transition-colors">{doc.numero}</span>
                        <span className={`badge ${getStatusBadge(doc.statut)} text-[9px] px-2 py-0.5`}>
                          {getStatusLabel(doc.statut)}
                        </span>
                      </div>
                      <div className="text-sm text-secondary mt-0.5 truncate">
                        {fullName(doc.clients)} — {formatDate(doc.date_emission)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right font-black text-lg hidden sm:block">
                      {formatCurrency(doc.total_ttc)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transform group-hover:translateX(2px) transition-all" />
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
