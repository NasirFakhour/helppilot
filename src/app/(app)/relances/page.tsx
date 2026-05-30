import { createClient } from '@/utils/supabase/server'
import { formatCurrency, formatDate, fullName } from '@/lib/utils'
import { markRelanceSent, markAsPaid } from '@/app/(app)/actions'
import Header from '@/components/ui/Header'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { BellRing, Check, Mail } from 'lucide-react'

export default async function RelancesPage() {
  const supabase = await createClient()
  
  const { data: interventions } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .in('statut', ['terminee', 'facturee'])
    .in('statut_paiement', ['non-paye', 'en-attente'])
    .order('updated_at', { ascending: true })

  const { data: overdueInvoices } = await supabase
    .from('documents')
    .select('*, clients(*)')
    .eq('type', 'facture')
    .eq('statut', 'envoye')
    .lt('date_echeance', new Date().toISOString())

  const now = new Date()
  
  const relancesInterventions = (interventions || []).map((i: any) => {
    const dateToCompare = i.updated_at || i.date
    const days = Math.floor((now.getTime() - new Date(dateToCompare).getTime()) / (1000 * 60 * 60 * 24))
    
    let type = null
    let urgency = 0
    if (days >= 21) { type = 'J+21'; urgency = 3 }
    else if (days >= 14) { type = 'J+14'; urgency = 2 }
    else if (days >= 7) { type = 'J+7'; urgency = 1 }
    
    return { ...i, relanceSource: 'intervention', daysPassed: days, relanceType: type, urgency }
  }).filter(i => i.relanceType !== null)

  const relancesInvoices = (overdueInvoices || []).map((inv: any) => {
    const days = Math.floor((now.getTime() - new Date(inv.date_echeance).getTime()) / (1000 * 60 * 60 * 24))
    return { 
      ...inv, 
      relanceSource: 'invoice', 
      montant: inv.total_ttc, 
      description: `Facture ${inv.numero}`,
      relanceType: `Retard J+${days}`,
      urgency: 4 
    }
  })

  const relances = [...relancesInterventions, ...relancesInvoices].sort((a, b) => b.urgency - a.urgency)

  const pendingPayments = relances.reduce((acc: number, i: any) => acc + (i.montant || 0), 0)

  return (
    <div className="animate-fade-in">
      <Header>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relances de paiement</h1>
            <p className="text-secondary">Suivi des factures impayées et missions terminées</p>
          </div>
          <Badge variant="danger" className="p-4 text-base font-bold shadow-md">
            À recouvrer : {formatCurrency(pendingPayments)}
          </Badge>
        </div>
      </Header>

      {!relances || relances.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><BellRing className="text-[var(--color-success)]" /></div>
            <h2 className="empty-state-title">Tout est à jour</h2>
            <p className="empty-state-desc">Excellente nouvelle ! Toutes les interventions terminées ont été réglées ou sont récentes.</p>
          </div>
        </div>
      ) : (
        <Card>
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold">Relances urgentes</h3>
            <div className="divide-y divide-[var(--color-border-light)]">
              {relances.map((r: any) => (
                <div key={`${r.relanceSource}-${r.id}`} className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6 sm:gap-8 hover:bg-[var(--color-surface)] transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={r.urgency >= 3 ? 'danger' : r.urgency === 2 ? 'warning' : 'primary'}>{r.relanceType}</Badge>
                      {r.statut_paiement === 'en-attente' && <Badge variant="neutral">Déjà relancé</Badge>}
                      {r.relanceSource === 'invoice' && <Badge variant="info">Facture</Badge>}
                    </div>
                    <div className="text-lg sm:text-xl font-bold group-hover:text-[var(--color-accent)] transition-colors truncate">{fullName(r.clients)}</div>
                    <div className="text-sm text-secondary mt-1.5 leading-relaxed">
                      {r.relanceSource === 'invoice' ? `Échéance le ${formatDate(r.date_echeance)}` : `Terminée le ${formatDate(r.date)}`} — {r.description}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between md:justify-end gap-5 w-full md:w-auto pt-5 md:pt-0 border-t border-slate-100 md:border-none">
                    <div className="text-2xl font-black md:text-right md:min-w-[120px] text-slate-900 flex-shrink-0 w-full sm:w-auto text-left">
                      {formatCurrency(r.montant)}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <form action={markRelanceSent.bind(null, r.id)} className="w-full sm:w-auto">
                        <Button variant="secondary" disabled={r.statut_paiement === 'en-attente'}>
                          <Mail className="w-5 h-5 mr-2" />
                          Relancer
                        </Button>
                      </form>
                      <form action={markAsPaid.bind(null, r.id)} className="w-full sm:w-auto">
                        <Button variant="success">
                          <Check className="w-5 h-5 mr-2" />
                          Marquer Payé
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
