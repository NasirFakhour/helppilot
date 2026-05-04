import { createClient } from '@/utils/supabase/server'
import { formatCurrency, formatDate, fullName } from '@/lib/utils'
import { markRelanceSent, markAsPaid } from '@/app/(app)/actions'
import { BellRing, Check, Mail, ChevronRight } from 'lucide-react'

export default async function RelancesPage() {
  const supabase = await createClient()
  
  const { data: interventions } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .eq('statut', 'terminee')
    .in('statut_paiement', ['non-paye', 'en-attente'])
    .order('updated_at', { ascending: true })

  const now = new Date()
  
  const relances = (interventions || []).map((i: any) => {
    const dateToCompare = i.updated_at || i.date
    const days = Math.floor((now.getTime() - new Date(dateToCompare).getTime()) / (1000 * 60 * 60 * 24))
    
    let type = null
    let urgency = 0
    if (days >= 21) { type = 'J+21'; urgency = 3 }
    else if (days >= 14) { type = 'J+14'; urgency = 2 }
    else if (days >= 7) { type = 'J+7'; urgency = 1 }
    
    return { ...i, daysPassed: days, relanceType: type, urgency }
  }).filter(i => i.relanceType !== null).sort((a, b) => b.urgency - a.urgency)

  const pendingPayments = relances.reduce((acc: number, i: any) => acc + (i.montant || 0), 0)

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Relances de paiement</h1>
          <p>Suivi des factures impayées à J+7, J+14 et J+21</p>
        </div>
        <div className="page-header-actions">
          <div className="badge badge-danger p-4 text-sm font-bold shadow-sm">
            À recouvrer : {formatCurrency(pendingPayments)}
          </div>
        </div>
      </div>

      {!relances || relances.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><BellRing className="text-[var(--color-success)]" /></div>
            <h2 className="empty-state-title">Tout est à jour</h2>
            <p className="empty-state-desc">Excellente nouvelle ! Toutes les interventions terminées ont été réglées ou sont récentes.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Relances urgentes</h3>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-[var(--color-border-light)]">
              {relances.map((r: any) => (
                <div key={r.id} className="relance-item p-6">
                  <div className="relance-content">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${r.urgency === 3 ? 'badge-danger' : r.urgency === 2 ? 'badge-warning' : 'badge-primary'}`}>
                        {r.relanceType}
                      </span>
                      {r.statut_paiement === 'en-attente' && (
                        <span className="badge badge-neutral">Déjà relancé</span>
                      )}
                    </div>
                    <div className="relance-client">{fullName(r.clients)}</div>
                    <div className="relance-detail">
                      Intervention du {formatDate(r.date)} — {r.description}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="text-xl font-bold md:mr-4">
                      {formatCurrency(r.montant)}
                    </div>
                    <div className="relance-actions w-full sm:w-auto">
                      <form action={markRelanceSent.bind(null, r.id)} className="flex-1 sm:flex-none">
                        <button type="submit" className="btn btn-secondary w-full" disabled={r.statut_paiement === 'en-attente'}>
                          <Mail className="w-4 h-4" />
                          <span>{r.statut_paiement === 'en-attente' ? 'Relancé' : 'Relancer'}</span>
                        </button>
                      </form>
                      <form action={markAsPaid.bind(null, r.id)} className="flex-1 sm:flex-none">
                        <button type="submit" className="btn btn-success w-full">
                          <Check className="w-4 h-4" />
                          <span>Payé</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

