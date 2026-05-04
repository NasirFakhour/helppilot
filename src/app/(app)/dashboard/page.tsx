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

  const pendingPayments = (unpaidInterventions || []).reduce((acc: number, i: any) => acc + (i.montant || 0), 0)

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
          <Link href="/interventions/new" className="btn btn-primary">
            Planifier une mission
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div className="stat-icon stat-icon-primary">
              <CalendarDays />
            </div>
            <span className="badge badge-primary">Aujourd'hui</span>
          </div>
          <div className="mt-4">
            <p className="stat-label">Interventions</p>
            <p className="stat-value">{todayInterventions?.length || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div className="stat-icon stat-icon-success">
              <Wallet />
            </div>
          </div>
          <div className="mt-4">
            <p className="stat-label">En attente de règlement</p>
            <p className="stat-value">{formatCurrency(pendingPayments)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div className="stat-icon stat-icon-warning">
              <Bell />
            </div>
            {relances.length > 0 && <span className="badge badge-danger">Urgent</span>}
          </div>
          <div className="mt-4">
            <p className="stat-label">Relances à effectuer</p>
            <p className="stat-value">{relances.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted" />
              Agenda du jour
            </h3>
          </div>
          
          <div className="card-body">
            <div className="space-y-6">
              {todayInterventions && todayInterventions.length > 0 ? (
                todayInterventions.map((i: any) => (
                  <InterventionTimelineRow key={i.id} intervention={i} />
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                  <p className="text-muted font-medium">Aucune intervention prévue</p>
                </div>
              )}
              
              {overdueInterventions && overdueInterventions.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-danger/20"></div>
                    <span className="text-xs font-bold text-danger uppercase tracking-widest">En Retard</span>
                    <div className="h-px flex-1 bg-danger/20"></div>
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

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted" />
              Relances urgentes
            </h3>
          </div>
          <div className="card-body p-0">
            {relances.length > 0 ? (
              relances.slice(0, 5).map((r: any) => (
                <RelanceRow key={r.id} relance={r} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-success mb-4 opacity-20" />
                <p className="font-semibold">Tout est à jour</p>
                <p className="text-sm text-muted mt-1">Aucune facture en retard de paiement.</p>
              </div>
            )}
          </div>
          {relances.length > 0 && (
            <div className="card-footer">
              <Link href="/relances" className="btn btn-secondary w-full group">
                Voir toutes les relances
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InterventionTimelineRow({ intervention: i, isOverdue = false }: { intervention: any, isOverdue?: boolean }) {
  const badgeColors: Record<string, string> = {
    'planifiee': 'primary',
    'en-cours': 'warning',
    'terminee': 'success',
    'annulee': 'neutral',
  }
  const statusLabels: Record<string, string> = {
    'planifiee': 'À faire',
    'en-cours': 'En cours',
    'terminee': 'Terminé',
    'annulee': 'Annulé'
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

