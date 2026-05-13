import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Trash2, Edit, MapPin, Phone } from 'lucide-react'
import { formatCurrency, formatDate, fullName } from '@/lib/utils'
import { PdfGenerator } from '@/components/PdfGenerator'

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: document } = await supabase
    .from('documents')
    .select('*, clients(*), document_lignes(*)')
    .eq('id', resolvedParams.id)
    .single()

  if (!document) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Document introuvable</h2>
        <Link href="/documents" className="btn btn-secondary mt-4">Retour aux documents</Link>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()

  const typeLabel = document.type === 'facture' ? 'Facture' : 'Devis'

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/documents" className="btn btn-ghost btn-sm -ml-3">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux documents</span>
        </Link>
      </div>

      <div className="page-header items-start sm:items-center">
        <div className="page-header-left">
          <h1 className="text-3xl font-bold tracking-tight">{typeLabel} {document.numero}</h1>
          <p className="text-secondary">Créé le {formatDate(document.date_emission)}</p>
        </div>
        <div className="page-header-actions w-full sm:w-auto">
          <PdfGenerator document={document} client={document.clients} profile={profile || {}} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Émetteur</h3>
          </div>
          <div className="card-body text-sm space-y-2">
            <div className="font-bold text-xl text-[var(--color-text)] mb-2">{profile?.nom_societe || 'Mon Entreprise'}</div>
            {profile?.adresse && <div className="flex items-center gap-2 text-secondary"><MapPin className="w-3.5 h-3.5" /> {profile.adresse}</div>}
            {(profile?.code_postal || profile?.ville) && (
              <div className="text-secondary ml-5">{profile.code_postal} {profile.ville}</div>
            )}
            {profile?.telephone && <div className="flex items-center gap-2 text-secondary"><Phone className="w-3.5 h-3.5" /> {profile.telephone}</div>}
            {profile?.siret && <div className="mt-4 pt-4 border-t border-[var(--color-border-light)] text-xs text-muted">SIRET : {profile.siret}</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Destinataire</h3>
          </div>
          <div className="card-body text-sm space-y-2">
            <div className="font-bold text-xl text-[var(--color-text)] mb-2">{fullName(document.clients)}</div>
            {document.clients?.adresse && <div className="flex items-center gap-2 text-secondary"><MapPin className="w-3.5 h-3.5" /> {document.clients.adresse}</div>}
            {(document.clients?.code_postal || document.clients?.ville) && (
              <div className="text-secondary ml-5">{document.clients.code_postal} {document.clients.ville}</div>
            )}
            {document.clients?.telephone && <div className="flex items-center gap-2 text-secondary"><Phone className="w-3.5 h-3.5" /> {document.clients.telephone}</div>}
            {document.clients?.siret && <div className="mt-4 pt-4 border-t border-[var(--color-border-light)] text-xs text-muted">SIRET : {document.clients.siret}</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card md:col-span-2">
          <div className="card-header">
            <h3 className="card-title">Détail des prestations</h3>
          </div>
          <div className="card-body p-0">
            <div className="table-wrapper">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface)] text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold text-center w-24">Quantité</th>
                    <th className="px-4 py-3 font-semibold text-right w-32">P.U. HT</th>
                    <th className="px-4 py-3 font-semibold text-right w-32">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-light)]">
                  {document.document_lignes?.sort((a:any, b:any) => a.ordre - b.ordre).map((line: any) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3 font-medium">{line.description}</td>
                      <td className="px-4 py-3 text-center">{line.quantite}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(line.prix_unitaire_ht)}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatCurrency(line.total_ht)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end p-6 bg-[var(--color-surface)]">
              <div className="w-64 space-y-3">
                <div className="flex justify-between items-center text-muted">
                  <span>Total HT</span>
                  <span>{formatCurrency(document.total_ht)}</span>
                </div>
                {document.tva_taux > 0 && (
                  <div className="flex justify-between items-center text-muted">
                    <span>TVA ({document.tva_taux}%)</span>
                    <span>{formatCurrency(document.total_ttc - document.total_ht)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-2xl pt-2 border-t border-[var(--color-border)]">
                  <span>Total TTC</span>
                  <span className="text-[var(--color-accent)]">{formatCurrency(document.total_ttc)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {document.notes && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Notes</h3>
              </div>
              <div className="card-body text-sm text-muted">
                {document.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
