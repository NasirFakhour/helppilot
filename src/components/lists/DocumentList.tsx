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

      <div className="flex p-1 bg-slate-100/80 backdrop-blur-md rounded-xl max-w-sm mb-8 border border-slate-200/60 shadow-inner">
        <button 
          onClick={() => { router.push('/documents?type=devis'); setFilterStatut('all'); setSearch('') }}
          className={`flex-1 px-6 py-2.5 font-bold text-sm rounded-lg transition-all ${defaultTab === 'devis' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Devis
        </button>
        <button 
          onClick={() => { router.push('/documents?type=facture'); setFilterStatut('all'); setSearch('') }}
          className={`flex-1 px-6 py-2.5 font-bold text-sm rounded-lg transition-all ${defaultTab === 'facture' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
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
                <Link key={doc.id} href={`/documents/${doc.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-7 hover:bg-[var(--color-surface)] transition-all group gap-4">
                  <div className="flex items-center gap-5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                      <FileOutput className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="text-lg group-hover:text-[var(--color-accent)] transition-colors">{doc.numero}</span>
                        <span className={`badge ${getStatusBadge(doc.statut)}`}>
                          {getStatusLabel(doc.statut)}
                        </span>
                      </div>
                      <div className="text-sm text-secondary mt-1 truncate">
                        <span className="font-semibold text-slate-700">{fullName(doc.clients)}</span> — {formatDate(doc.date_emission)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 flex-shrink-0 border-t border-slate-100 sm:border-none pt-4 sm:pt-0">
                    <div className="text-left sm:text-right font-black text-xl text-slate-900">
                      {formatCurrency(doc.total_ttc)}
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transform group-hover:translate-x-1 transition-all" />
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
