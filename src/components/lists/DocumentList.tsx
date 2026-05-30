'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search, ChevronRight, FileOutput } from 'lucide-react'
import { formatCurrency, formatDate, fullName } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

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
          <h1 className="text-3xl font-bold tracking-tight">Devis & Factures</h1>
          <p className="text-secondary">Gérez vos documents commerciaux et votre facturation</p>
        </div>
        <div className="page-header-actions">
          <Link href={`/documents/new?type=${defaultTab}`}>
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              Nouveau {defaultTab}
            </Button>
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
        <Card className="p-6 text-center">
          <div className="empty-state">
            <div className="empty-state-icon"><FileText /></div>
            <h2 className="empty-state-title">Aucun {defaultTab}</h2>
            <p className="empty-state-desc">Vous n'avez pas encore créé de {defaultTab}.</p>
            <Link href={`/documents/new?type=${defaultTab}`}>
              <Button variant="primary" className="mt-4">Créer mon premier {defaultTab}</Button>
            </Link>
          </div>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="empty-state py-12">
            <Search className="w-12 h-12 text-muted mb-4 opacity-50" />
            <h2 className="text-lg font-bold">Aucun résultat</h2>
            <p className="text-muted mt-2">Aucun {defaultTab} ne correspond à votre recherche.</p>
            <Button variant="neutral" className="mt-4" onClick={() => { setSearch(''); setFilterStatut('all') }}>Réinitialiser les filtres</Button>
          </div>
        </Card>
      ) : (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="card-title">Vos {defaultTab}s</h3>
            {(search || filterStatut !== 'all') && <span className="text-xs text-muted font-medium">{filteredDocuments.length} résultat(s)</span>}
          </div>
          <div className="card-body p-0 overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-slate-700">Numéro</th>
                  <th className="px-6 py-3 text-sm font-medium text-slate-700">Client</th>
                  <th className="px-6 py-3 text-sm font-medium text-slate-700">Date</th>
                  <th className="px-6 py-3 text-sm font-medium text-slate-700">Montant</th>
                  <th className="px-6 py-3 text-sm font-medium text-slate-700">Statut</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-[var(--color-surface)] transition-colors cursor-pointer" onClick={() => router.push(`/documents/${doc.id}`)}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-primary flex items-center justify-center shadow-sm">
                        <FileOutput className="w-6 h-6" />
                      </div>
                      <span className="text-lg font-bold group-hover:text-[var(--color-accent)] transition-colors">{doc.numero}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{fullName(doc.clients)}</td>
                    <td className="px-6 py-4 text-sm text-secondary">{formatDate(doc.date_emission)}</td>
                    <td className="px-6 py-4 text-xl font-black text-slate-900">{formatCurrency(doc.total_ttc)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        (() => {
                          const map = {
                            'brouillon': 'neutral',
                            'envoye': 'primary',
                            'accepte': 'success',
                            'paye': 'success',
                            'refuse': 'danger',
                            'retard': 'danger',
                          } as const;
                          const key = doc.statut as keyof typeof map;
                          return map[key] || 'neutral';
                        })()
                      }>{getStatusLabel(doc.statut)}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
