import { createClient } from '@/utils/supabase/server'
import { formatCurrency, formatTime, formatDate, truncate, fullName } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Calendar, ChevronRight } from 'lucide-react'

export default async function InterventionsPage() {
  const supabase = await createClient()
  
  const { data: interventions } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .order('date', { ascending: false })

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

      {!interventions || interventions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Calendar /></div>
            <h2 className="empty-state-title">Aucune intervention</h2>
            <p className="empty-state-desc">Vous n'avez pas encore d'intervention planifiée. Créez-en une dès maintenant.</p>
            <Link href="/interventions/new" className="btn btn-primary mt-4">Planifier une intervention</Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Toutes les interventions</h3>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-[var(--color-border-light)]">
              {interventions.map((i: any) => (
                <Link key={i.id} href={`/interventions/${i.id}/edit`} className="intervention-item">
                  <div className="intervention-time">
                    <div className="time">{formatTime(i.date)}</div>
                    <div className="date">{formatDate(i.date)}</div>
                  </div>
                  <div className={`intervention-dot ${i.statut === 'en-cours' ? 'warning' : i.statut === 'terminee' ? 'success' : i.statut === 'annulee' ? 'neutral' : ''}`}></div>
                  <div className="intervention-content">
                    <div className="intervention-client">{fullName(i.clients)}</div>
                    <div className="intervention-desc">{truncate(i.description, 100)}</div>
                    <div className="intervention-meta">
                      <span className={`badge badge-${badgeColors[i.statut]}`}>{statusLabels[i.statut]}</span>
                      <span className={`badge badge-${paymentColors[i.statut_paiement]}`}>{paymentLabels[i.statut_paiement]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right font-bold text-lg hidden sm:block">
                      {formatCurrency(i.montant)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
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

