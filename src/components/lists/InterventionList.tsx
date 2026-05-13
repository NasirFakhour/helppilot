'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Calendar, ChevronRight, Search } from 'lucide-react'
import { formatCurrency, formatTime, formatDate, truncate, fullName } from '@/lib/utils'

export function InterventionList({ initialInterventions }: { initialInterventions: any[] }) {
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')

  const badgeColors: Record<string, string> = {
    'a-planifier': 'neutral',
    'planifiee': 'primary',
    'en-cours': 'warning',
    'terminee': 'success',
    'facturee': 'info',
    'annulee': 'danger',
  }
  const statusLabels: Record<string, string> = {
    'a-planifier': 'À planifier',
    'planifiee': 'À faire',
    'en-cours': 'En cours',
    'terminee': 'Terminée',
    'facturee': 'Facturée',
    'annulee': 'Annulée'
  }
  const paymentColors: Record<string, string> = {
    'non-paye': 'danger',
    'en-attente': 'warning',
    'paye': 'success'
  }
  const paymentLabels: Record<string, string> = {
    'non-paye': 'Non réglé',
    'en-attente': 'Relancé',
    'paye': 'Réglé'
  }

  const filteredInterventions = useMemo(() => {
    let result = initialInterventions

    if (filterStatut !== 'all') {
      result = result.filter(i => i.statut === filterStatut)
    }

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(i => {
        const clientName = fullName(i.clients).toLowerCase()
        const desc = (i.description || '').toLowerCase()
        return clientName.includes(query) || desc.includes(query)
      })
    }

    return result
  }, [initialInterventions, search, filterStatut])

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Interventions</h1>
          <p>Historique et planning de vos missions</p>
        </div>
        <div className="page-header-actions">
          <Link href="/interventions/new" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            <span>Nouvelle intervention</span>
          </Link>
        </div>
      </div>

      {initialInterventions.length > 0 && (
        <div className="filter-bar mb-6">
          <div className="search-bar w-full max-w-md">
            <Search className="w-4 h-4" />
            <input
              type="search"
              placeholder="Rechercher par client, description..."
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
            <option value="a-planifier">À planifier</option>
            <option value="planifiee">À faire</option>
            <option value="en-cours">En cours</option>
            <option value="terminee">Terminées</option>
            <option value="facturee">Facturées</option>
            <option value="annulee">Annulées</option>
          </select>
        </div>
      )}

      {initialInterventions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Calendar /></div>
            <h2 className="empty-state-title">Aucune intervention</h2>
            <p className="empty-state-desc">Vous n'avez pas encore d'intervention planifiée. Créez-en une dès maintenant.</p>
            <Link href="/interventions/new" className="btn btn-primary mt-4">Planifier une intervention</Link>
          </div>
        </div>
      ) : filteredInterventions.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <Search className="w-12 h-12 text-muted mb-4 opacity-50" />
            <h2 className="text-lg font-bold">Aucun résultat</h2>
            <p className="text-muted mt-2">Aucune intervention ne correspond à votre recherche.</p>
            <button onClick={() => { setSearch(''); setFilterStatut('all') }} className="btn btn-ghost mt-4">Réinitialiser les filtres</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="card-title">Toutes les interventions</h3>
            {(search || filterStatut !== 'all') && <span className="text-xs text-muted font-medium">{filteredInterventions.length} résultat(s)</span>}
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-[var(--color-border-light)]">
              {filteredInterventions.map((i: any) => (
                <Link key={i.id} href={`/interventions/${i.id}/edit`} className="intervention-item hover:bg-[var(--color-surface)] transition-all group p-5">
                  <div className="intervention-time sm:min-w-[64px]">
                    <div className="time text-base">{formatTime(i.date)}</div>
                    <div className="date text-[10px] text-muted">{formatDate(i.date)}</div>
                  </div>
                  <div className={`intervention-dot mt-2.5 ${i.statut === 'en-cours' ? 'warning' : i.statut === 'terminee' ? 'success' : i.statut === 'facturee' ? 'info' : i.statut === 'annulee' ? 'danger' : ''}`}></div>
                  <div className="intervention-content">
                    <div className="intervention-client group-hover:text-[var(--color-accent)] transition-colors">{fullName(i.clients)}</div>
                    <div className="intervention-desc text-secondary leading-normal">{truncate(i.description, 80)}</div>
                    <div className="intervention-meta flex-wrap gap-2 mt-2">
                      <span className={`badge badge-${badgeColors[i.statut]} text-[10px]`}>{statusLabels[i.statut]}</span>
                      {i.statut === 'terminee' && <span className={`badge badge-${paymentColors[i.statut_paiement]} text-[10px]`}>{paymentLabels[i.statut_paiement]}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right font-bold text-lg hidden md:block">
                      {formatCurrency(i.montant)}
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
