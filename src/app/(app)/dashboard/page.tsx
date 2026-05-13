import { createClient } from '@/utils/supabase/server'
import { Intervention, Client } from '@/lib/types'
import { formatCurrency, formatTime, formatDate, truncate, fullName } from '@/lib/utils'
import Link from 'next/link'
import { EmptyStateDashboard } from '@/components/EmptyStates'
import { 
  CalendarDays, 
  Wallet, 
  Bell, 
  ArrowUpRight, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch today's interventions
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const { data: todayInterventions } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .gte('date', todayStart.toISOString())
    .lte('date', todayEnd.toISOString())
    .neq('statut', 'annulee')
    .order('date', { ascending: true })
    
  // Check if user has ANY data
  const { count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  // Fetch overdue interventions
  const { data: overdueInterventions } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .lt('date', todayStart.toISOString())
    .in('statut', ['planifiee', 'en-cours'])
    .order('date', { ascending: true })

  // Fetch relances
  const { data: unpaidInterventions } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .eq('statut', 'terminee')
    .eq('statut_paiement', 'non-paye')

  // Fetch month turnover (factures payées ce mois-ci)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data: monthFactures } = await supabase
    .from('documents')
    .select('total_ttc')
    .eq('type', 'facture')
    .eq('statut', 'paye')
    .gte('date_emission', monthStart.toISOString())

  const monthTurnover = (monthFactures || []).reduce((acc: number, d: any) => acc + (d.total_ttc || 0), 0)

  // Fetch pending quotes
  const { data: pendingQuotes } = await supabase
    .from('documents')
    .select('total_ttc')
    .eq('type', 'devis')
    .eq('statut', 'envoye')

  const pendingQuotesAmount = (pendingQuotes || []).reduce((acc: number, d: any) => acc + (d.total_ttc || 0), 0)

  // Fetch overdue invoices
  const { data: overdueInvoices } = await supabase
    .from('documents')
    .select('*, clients(*)')
    .eq('type', 'facture')
    .eq('statut', 'envoye')
    .lt('date_echeance', new Date().toISOString())

  const pendingPayments = (unpaidInterventions || []).reduce((acc: number, i: any) => acc + (i.montant || 0), 0)

  const now = new Date()
  const relances = (unpaidInterventions || []).map((i: any) => {
    const dateToCompare = i.updated_at || i.date
    const days = Math.floor((now.getTime() - new Date(dateToCompare).getTime()) / (1000 * 60 * 60 * 24))
    let type = null
    if (days >= 21) type = 'J+21'
    else if (days >= 14) type = 'J+14'
    else if (days >= 7) type = 'J+7'
    return { ...i, daysPassed: days, relanceType: type }
  }).filter((i) => i.relanceType !== null)

  const todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  if (clientCount === 0) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Tableau de bord</h1>
            <p className="capitalize">{todayStr}</p>
          </div>
        </div>
        <EmptyStateDashboard />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="text-3xl font-black tracking-tight">Bonjour !</h1>
          <p className="text-lg opacity-60 capitalize">{todayStr}</p>
        </div>
        <div className="page-header-actions">
          <Link href="/planning" className="btn btn-secondary">
            <CalendarDays className="w-4 h-4 mr-2" />
            Voir le planning
          </Link>
          <Link href="/interventions/new" className="btn btn-primary">
            Planifier une mission
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="stat-label">Chiffre du mois (payé)</p>
          <p className="stat-value text-[var(--color-success)]">{formatCurrency(monthTurnover)}</p>
          <p className="stat-sub">Objectif atteint</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">En attente (Devis)</p>
          <p className="stat-value">{formatCurrency(pendingQuotesAmount)}</p>
          <p className="stat-sub">{pendingQuotes?.length || 0} devis envoyés</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">À facturer</p>
          <p className="stat-value text-[var(--color-warning)]">{formatCurrency(pendingPayments)}</p>
          <p className="stat-sub">{unpaidInterventions?.length || 0} missions terminées</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Factures en retard</p>
          <p className="stat-value text-[var(--color-danger)]">{(overdueInvoices || []).length}</p>
          <p className="stat-sub">Action requise 🚨</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted" />
                Interventions du jour
              </h3>
              <Link href="/interventions" className="text-xs font-bold text-primary hover:underline">Voir tout</Link>
            </div>
            
            <div className="card-body">
              <div className="space-y-6">
                {todayInterventions && todayInterventions.length > 0 ? (
                  todayInterventions.map((i: any) => (
                    <InterventionTimelineRow key={i.id} intervention={i} />
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                    <p className="text-muted font-medium">Rien de prévu aujourd'hui</p>
                    <Link href="/interventions/new" className="btn btn-sm btn-secondary mt-4">Créer une intervention</Link>
                  </div>
                )}
                
                {overdueInterventions && overdueInterventions.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-[var(--color-border-light)]">
                    <div className="flex items-center gap-2 mb-6">
                      <AlertCircle className="w-4 h-4 text-danger" />
                      <span className="text-xs font-black text-danger uppercase tracking-widest">Retards à traiter</span>
                    </div>
                    <div className="space-y-6">
                      {overdueInterventions.map((i: any) => (
                        <InterventionTimelineRow key={i.id} intervention={i} isOverdue={true} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card border-danger/20">
            <div className="card-header bg-danger/[0.02]">
              <h3 className="card-title flex items-center gap-2 text-danger">
                <AlertCircle className="w-4 h-4" />
                Urgences & Relances
              </h3>
            </div>
            <div className="card-body p-0">
              {relances.length > 0 || (overdueInvoices || []).length > 0 ? (
                <div className="divide-y divide-[var(--color-border-light)]">
                  {overdueInvoices?.map((inv: any) => (
                    <div key={inv.id} className="p-4 hover:bg-danger/[0.02] transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black uppercase text-danger">Facture en retard</span>
                        <span className="text-xs font-bold">{formatCurrency(inv.total_ttc)}</span>
                      </div>
                      <div className="font-bold text-sm">{fullName(inv.clients)}</div>
                      <div className="text-xs text-muted mt-1">N° {inv.numero}</div>
                    </div>
                  ))}
                  {relances.map((r: any) => (
                    <div key={r.id} className="p-4 hover:bg-warning/[0.02] transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black uppercase text-warning">Relance {r.relanceType}</span>
                        <span className="text-xs font-bold">{formatCurrency(r.montant)}</span>
                      </div>
                      <div className="font-bold text-sm">{fullName(r.clients)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-success mb-4 opacity-20" />
                  <p className="font-semibold text-sm">Tout est en ordre</p>
                </div>
              )}
            </div>
            {(relances.length > 0 || (overdueInvoices || []).length > 0) && (
              <div className="card-footer">
                <Link href="/relances" className="btn btn-secondary btn-sm w-full">Gérer les relances</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InterventionTimelineRow({ intervention: i, isOverdue = false }: { intervention: any, isOverdue?: boolean }) {
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
    'planifiee': 'Planifiée',
    'en-cours': 'En cours',
    'terminee': 'Terminée',
    'facturee': 'Facturée',
    'annulee': 'Annulée'
  }

  return (
    <Link href={`/interventions/${i.id}/edit`} className="group block">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full mt-1.5 ring-4 ${isOverdue ? 'bg-danger ring-danger/10' : 'bg-accent ring-accent/10'}`}></div>
          <div className="w-px flex-1 bg-[var(--color-border)] my-2"></div>
        </div>
        <div className="flex-1 pb-6">
          <div className="flex justify-between items-start mb-1">
            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{formatTime(i.date)}</span>
              <h4 className="text-base font-bold group-hover:text-accent transition-colors">{fullName(i.clients)}</h4>
            </div>
            <div className="text-right">
              <p className="text-base font-black">{formatCurrency(i.montant)}</p>
              <span className={`badge badge-${badgeColors[i.statut]} mt-1`}>{statusLabels[i.statut]}</span>
            </div>
          </div>
          <p className="text-sm text-muted line-clamp-1">{i.description}</p>
        </div>
      </div>
    </Link>
  )
}

function RelanceRow({ relance: r }: { relance: any }) {
  return (
    <div className="flex justify-between items-center p-5 border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface)] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{fullName(r.clients)}</div>
        <div className="text-xs text-muted flex items-center gap-2 mt-1">
          <span>{formatDate(r.date)}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
          <span className="font-bold">{formatCurrency(r.montant)}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <span className="badge badge-warning">{r.relanceType}</span>
        <ChevronRight className="w-4 h-4 text-muted" />
      </div>
    </div>
  )
}

