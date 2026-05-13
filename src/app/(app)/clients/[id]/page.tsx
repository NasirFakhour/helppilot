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

      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="avatar avatar-xl">
            {initials(client.nom, client.prenom)}
          </div>
          <div>
            <h1>{fullName(client)}</h1>
            <p className="text-muted">Client depuis le {formatDate(client.created_at)}</p>
          </div>
        </div>
        <div className="page-header-actions">
          <Link href={`/clients/${client.id}/edit`} className="btn btn-secondary">
            <Edit className="w-4 h-4" />
            <span>Modifier</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <p className="stat-label">Total facturé</p>
          <p className="stat-value">{formatCurrency(totalInvoiced)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total réglé</p>
          <p className="stat-value text-success">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Reste à percevoir</p>
          <p className="stat-value text-danger">{formatCurrency(balance)}</p>
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
                {interventions?.map((i: any) => (
                  <Link key={i.id} href={`/interventions/${i.id}/edit`} className="flex items-center gap-4 p-4 hover:bg-[var(--color-surface)] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-light)] flex flex-col items-center justify-center text-[var(--color-accent)]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="font-bold truncate">{i.description}</div>
                        <div className="font-black ml-2">{formatCurrency(i.montant)}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                        <span>{formatDate(i.date)}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                        <span className="capitalize">{i.statut}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </Link>
                ))}
                {documents?.map((d: any) => (
                  <Link key={d.id} href={`/documents/${d.id}`} className="flex items-center gap-4 p-4 hover:bg-[var(--color-surface)] transition-colors">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${d.type === 'facture' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="font-bold truncate">{d.type === 'facture' ? 'Facture' : 'Devis'} {d.numero}</div>
                        <div className="font-black ml-2">{formatCurrency(d.total_ttc)}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                        <span>{formatDate(d.date_emission)}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                        <span className="capitalize">{d.statut}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
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
