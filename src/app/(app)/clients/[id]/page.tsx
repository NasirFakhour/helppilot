import { createClient } from '@/utils/supabase/server'
import { formatCurrency, formatDate, formatTime, fullName, initials } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Edit, Calendar, ChevronRight, Plus, Mail, Phone, MapPin, FileText } from 'lucide-react'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!client) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Client introuvable</h2>
        <Link href="/clients" className="btn btn-secondary mt-4">Retour aux clients</Link>
      </div>
    )
  }

  const { data: interventions } = await supabase
    .from('interventions')
    .select('*')
    .eq('client_id', client.id)
    .order('date', { ascending: false })

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('client_id', client.id)
    .order('date_emission', { ascending: false })

  const totalInvoiced = documents?.filter(d => d.type === 'facture').reduce((acc, d) => acc + (d.total_ttc || 0), 0) || 0
  const totalPaid = documents?.filter(d => d.type === 'facture' && d.statut === 'paye').reduce((acc, d) => acc + (d.total_ttc || 0), 0) || 0
  const balance = totalInvoiced - totalPaid

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link href="/clients" className="btn btn-ghost btn-sm -ml-3">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux clients</span>
        </Link>
      </div>

      <div className="page-header items-start sm:items-center">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="avatar avatar-xl ring-4 ring-[var(--color-card)] shadow-md">
            {initials(client.nom, client.prenom)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{fullName(client)}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <p className="text-secondary text-sm">Client depuis le {formatDate(client.created_at)}</p>
              {client.societe && <span className="badge badge-neutral text-[10px]">{client.societe}</span>}
            </div>
          </div>
        </div>
        <div className="page-header-actions w-full sm:w-auto">
          <Link href={`/clients/${client.id}/edit`} className="btn btn-secondary flex-1 sm:flex-none shadow-sm">
            <Edit className="w-4 h-4" />
            <span>Modifier</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="stat-card">
          <p className="stat-label">Total facturé</p>
          <p className="stat-value">{formatCurrency(totalInvoiced)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total réglé</p>
          <p className="stat-value text-[var(--color-success)]">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Reste à percevoir</p>
          <p className="stat-value text-[var(--color-danger)]">{formatCurrency(balance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Coordonnées</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {client.telephone && (
                  <a href={`tel:${client.telephone}`} className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-xl hover:bg-[var(--color-border-light)] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted font-bold uppercase">Appeler</div>
                      <div className="font-bold">{client.telephone}</div>
                    </div>
                  </a>
                )}
                {client.adresse && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.adresse + ' ' + client.ville)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-xl hover:bg-[var(--color-border-light)] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted font-bold uppercase">Itinéraire</div>
                      <div className="font-bold line-clamp-1">{client.adresse}</div>
                    </div>
                  </a>
                )}
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-xl hover:bg-[var(--color-border-light)] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted font-bold uppercase">Email</div>
                      <div className="font-bold line-clamp-1">{client.email}</div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Notes client</h3>
            </div>
            <div className="card-body">
              {client.notes ? (
                <p className="text-sm whitespace-pre-line leading-relaxed">{client.notes}</p>
              ) : (
                <p className="text-xs text-muted italic">Aucune note particulière.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="card-title">Historique complet</h3>
              <Link href={`/interventions/new?client=${client.id}`} className="btn btn-sm btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Action
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="divide-y divide-[var(--color-border-light)]">
                {interventions?.map((i: any) => {
                  const badgeColors: Record<string, string> = {
                    'a-planifier': 'neutral',
                    'planifiee': 'primary',
                    'en-cours': 'warning',
                    'terminee': 'success',
                    'facturee': 'info',
                    'annulee': 'danger',
                  }
                  return (
                    <Link key={i.id} href={`/interventions/${i.id}/edit`} className="flex items-center gap-4 p-5 hover:bg-[var(--color-surface)] transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-light)] flex flex-col items-center justify-center text-[var(--color-accent)] shadow-sm group-hover:shadow-md transition-all">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-bold truncate group-hover:text-[var(--color-accent)] transition-colors">{i.description || 'Intervention'}</div>
                          <div className="font-bold ml-2">{formatCurrency(i.montant)}</div>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-secondary font-medium">{formatDate(i.date)}</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                          <span className={`badge badge-${badgeColors[i.statut]} text-[9px]`}>{i.statut}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transform group-hover:translateX(2px) transition-all" />
                    </Link>
                  )
                })}
                {documents?.map((d: any) => (
                  <Link key={d.id} href={`/documents/${d.id}`} className="flex items-center gap-4 p-5 hover:bg-[var(--color-surface)] transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shadow-sm group-hover:shadow-md transition-all ${d.type === 'facture' ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="font-bold truncate group-hover:text-[var(--color-accent)] transition-colors">{d.type === 'facture' ? 'Facture' : 'Devis'} {d.numero}</div>
                        <div className="font-bold ml-2">{formatCurrency(d.total_ttc)}</div>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-secondary font-medium">{formatDate(d.date_emission)}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                        <span className="capitalize text-secondary">{d.statut}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transform group-hover:translateX(2px) transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
