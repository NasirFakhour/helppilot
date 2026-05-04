import { createClient } from '@/utils/supabase/server'
import { formatCurrency, formatDate, formatTime, fullName, initials } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Edit, Calendar, ChevronRight, Plus, Mail, Phone, MapPin } from 'lucide-react'

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

  const unpaidTotal = interventions?.filter(i => i.statut_paiement === 'non-paye').reduce((acc, i) => acc + (i.montant || 0), 0) || 0

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Informations de contact</h3>
            </div>
            <div className="card-body">
              <div className="space-y-1">
                <div className="info-row">
                  <div className="info-label">Email</div>
                  <div className="info-value">
                    {client.email ? (
                      <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a>
                    ) : (
                      <span className="text-muted">Non renseigné</span>
                    )}
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Téléphone</div>
                  <div className="info-value">
                    {client.telephone ? (
                      <a href={`tel:${client.telephone}`} className="hover:underline">{client.telephone}</a>
                    ) : (
                      <span className="text-muted">Non renseigné</span>
                    )}
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Adresse</div>
                  <div className="info-value">
                    {client.adresse || client.ville ? (
                      <div>
                        {client.adresse && <div>{client.adresse}</div>}
                        <div className="text-muted">{client.code_postal} {client.ville}</div>
                      </div>
                    ) : (
                      <span className="text-muted">Non renseignée</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Notes</h3>
            </div>
            <div className="card-body">
              {client.notes ? (
                <p className="text-sm whitespace-pre-line leading-relaxed">{client.notes}</p>
              ) : (
                <p className="text-xs text-muted italic">Aucune note particulière pour ce client.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="card-title">Historique des interventions</h3>
              {unpaidTotal > 0 && (
                <span className="badge badge-danger">Reste dû : {formatCurrency(unpaidTotal)}</span>
              )}
            </div>
            <div className="card-body p-0">
              {!interventions || interventions.length === 0 ? (
                <div className="empty-state py-12">
                  <div className="empty-state-icon"><Calendar /></div>
                  <p className="empty-state-title">Aucune intervention</p>
                  <p className="empty-state-desc">Ce client n'a pas encore d'historique.</p>
                  <Link href={`/interventions/new?client=${client.id}`} className="btn btn-primary btn-sm mt-4">
                    Créer une intervention
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border-light)]">
                  {interventions.map((i: any) => (
                    <Link key={i.id} href={`/interventions/${i.id}/edit`} className="intervention-item">
                      <div className="intervention-time">
                        <div className="time">{formatTime(i.date)}</div>
                        <div className="date">{formatDate(i.date)}</div>
                      </div>
                      <div className={`intervention-dot ${i.statut === 'terminee' ? 'success' : i.statut === 'en-cours' ? 'warning' : 'neutral'}`}></div>
                      <div className="intervention-content">
                        <div className="intervention-client">{i.description || 'Intervention sans description'}</div>
                        <div className="intervention-meta">
                          <span className={`badge badge-${i.statut_paiement === 'paye' ? 'success' : 'danger'}`}>
                            {i.statut_paiement === 'paye' ? 'Réglé' : 'Non réglé'}
                          </span>
                          <span className="text-xs text-muted font-bold">{formatCurrency(i.montant)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="card-footer">
              <Link href={`/interventions/new?client=${client.id}`} className="btn btn-ghost w-full">
                <Plus className="w-4 h-4" />
                <span>Nouvelle intervention</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
