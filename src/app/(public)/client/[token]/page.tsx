import { createClient } from '@/utils/supabase/server'
import { formatCurrency, formatDate, fullName } from '@/lib/utils'
import { FileText, Calendar, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function PublicClientPortal({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('public_token', resolvedParams.token)
    .single()

  if (!client) {
    return <div className="min-h-screen flex items-center justify-center p-8 text-center">Accès refusé ou lien expiré.</div>
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

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-20">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-6 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center text-white font-black text-xl">T</div>
             <span className="font-black text-xl tracking-tight">TechniSuivi</span>
          </div>
          <div className="text-right">
            <p className="font-bold">{fullName(client)}</p>
            <p className="text-xs text-muted">Espace Client Sécurisé</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Interventions
            </h2>
            <div className="space-y-3">
              {interventions?.map(i => (
                <div key={i.id} className="card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase text-muted">{formatDate(i.date)}</span>
                    <span className={`badge badge-${i.statut === 'terminee' ? 'success' : 'primary'}`}>{i.statut}</span>
                  </div>
                  <p className="font-bold">{i.description}</p>
                </div>
              ))}
              {interventions?.length === 0 && <p className="text-sm text-muted italic">Aucune intervention enregistrée.</p>}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Documents
            </h2>
            <div className="space-y-3">
              {documents?.map(d => (
                <div key={d.id} className="card p-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold capitalize">{d.type} {d.numero}</p>
                      <p className="text-xs text-muted">Émis le {formatDate(d.date_emission)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">{formatCurrency(d.total_ttc)}</p>
                      <span className="text-[10px] font-black uppercase text-primary">{d.statut}</span>
                    </div>
                  </div>
                </div>
              ))}
              {documents?.length === 0 && <p className="text-sm text-muted italic">Aucun document disponible.</p>}
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-20 py-10 border-t border-[var(--color-border)] text-center text-xs text-muted">
        Propulsé par <span className="font-bold text-primary">TechniSuivi</span> — Logiciel de gestion pour techniciens.
      </footer>
    </div>
  )
}
