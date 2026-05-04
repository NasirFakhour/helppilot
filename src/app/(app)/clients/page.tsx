import { createClient } from '@/utils/supabase/server'
import { initials, fullName } from '@/lib/utils'
import Link from 'next/link'
import { Plus, MapPin, Phone, Mail, Users, ChevronRight } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('nom', { ascending: true })

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Clients</h1>
          <p>{clients?.length || 0} client{clients?.length !== 1 ? 's' : ''} dans votre base</p>
        </div>
        <div className="page-header-actions">
          <Link href="/clients/new" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            <span>Nouveau Client</span>
          </Link>
        </div>
      </div>

      {!clients || clients.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Users /></div>
            <h2 className="empty-state-title">Aucun client</h2>
            <p className="empty-state-desc">Vous n'avez pas encore ajouté de client à votre carnet d'adresses.</p>
            <Link href="/clients/new" className="btn btn-primary mt-4">Ajouter mon premier client</Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Carnet d'adresses</h3>
          </div>
          <div className="card-body p-0">
            <div className="table-wrapper">
              <div className="divide-y divide-[var(--color-border-light)]">
                {clients.map((c: any) => (
                  <Link key={c.id} href={`/clients/${c.id}`} className="client-card">
                    <div className="avatar">
                      {initials(c.nom, c.prenom)}
                    </div>
                    <div className="client-card-content">
                      <div className="client-name">{fullName(c)}</div>
                      <div className="client-meta">
                        {c.ville && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {c.ville}
                          </div>
                        )}
                        {c.telephone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {c.telephone}
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1 hidden sm:flex">
                            <Mail className="w-3 h-3" />
                            {c.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:block">
                        <span className="badge badge-neutral">Client</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
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

