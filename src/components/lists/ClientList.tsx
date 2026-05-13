'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, MapPin, Phone, Mail, Users, ChevronRight, Search } from 'lucide-react'
import { initials, fullName } from '@/lib/utils'

export function ClientList({ initialClients }: { initialClients: any[] }) {
  const [search, setSearch] = useState('')

  const filteredClients = useMemo(() => {
    if (!search.trim()) return initialClients
    
    const query = search.toLowerCase()
    return initialClients.filter(c => {
      const name = fullName(c).toLowerCase()
      const phone = c.telephone?.toLowerCase() || ''
      const email = c.email?.toLowerCase() || ''
      return name.includes(query) || phone.includes(query) || email.includes(query)
    })
  }, [initialClients, search])

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Clients</h1>
          <p>{initialClients.length} client{initialClients.length !== 1 ? 's' : ''} dans votre base</p>
        </div>
        <div className="page-header-actions">
          <Link href="/clients/new" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            <span>Nouveau Client</span>
          </Link>
        </div>
      </div>

      {initialClients.length > 0 && (
        <div className="filter-bar mb-6">
          <div className="search-bar w-full max-w-md">
            <Search className="w-4 h-4" />
            <input
              type="search"
              placeholder="Rechercher par nom, société, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}

      {initialClients.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Users /></div>
            <h2 className="empty-state-title">Aucun client</h2>
            <p className="empty-state-desc">Vous n'avez pas encore ajouté de client à votre carnet d'adresses.</p>
            <Link href="/clients/new" className="btn btn-primary mt-4">Ajouter mon premier client</Link>
          </div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <Search className="w-12 h-12 text-muted mb-4 opacity-50" />
            <h2 className="text-lg font-bold">Aucun résultat</h2>
            <p className="text-muted mt-2">Aucun client ne correspond à "{search}"</p>
            <button onClick={() => setSearch('')} className="btn btn-ghost mt-4">Effacer la recherche</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="card-title">Carnet d'adresses</h3>
            {search && <span className="text-xs text-muted font-medium">{filteredClients.length} résultat(s)</span>}
          </div>
          <div className="card-body p-0">
            <div className="table-wrapper">
              <div className="divide-y divide-[var(--color-border-light)]">
                {filteredClients.map((c: any) => (
                  <Link key={c.id} href={`/clients/${c.id}`} className="client-card hover:bg-[var(--color-surface)] transition-all group">
                    <div className="avatar ring-2 ring-[var(--color-card)] shadow-sm">
                      {initials(c.nom, c.prenom)}
                    </div>
                    <div className="client-card-content">
                      <div className="client-name group-hover:text-[var(--color-accent)] transition-colors">{fullName(c)}</div>
                      <div className="client-meta flex-wrap gap-x-4 gap-y-1">
                        {c.ville && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{c.ville}</span>
                          </div>
                        )}
                        {c.telephone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.telephone}</span>
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1.5 hidden md:flex">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{c.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transform group-hover:translateX(2px) transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
