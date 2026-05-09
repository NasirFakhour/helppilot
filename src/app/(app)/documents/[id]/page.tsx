import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Trash2, Edit } from 'lucide-react'
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

      <div className="page-header">
        <div className="page-header-left">
          <h1>{typeLabel} {document.numero}</h1>
          <p>Créé le {formatDate(document.date_emission)}</p>
        </div>
        <div className="page-header-actions">
          <PdfGenerator document={document} client={document.clients} profile={profile || {}} />
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
                <div className="flex justify-between items-center font-black text-xl pt-2 border-t border-[var(--color-border-light)]">
                  <span>Total TTC</span>
                  <span className="text-primary">{formatCurrency(document.total_ttc)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Informations</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <span className="text-xs text-muted block mb-1">Client</span>
                <Link href={`/clients/${document.client_id}`} className="font-bold hover:underline text-primary">
                  {fullName(document.clients)}
                </Link>
              </div>
              <div>
                <span className="text-xs text-muted block mb-1">Statut</span>
                <span className="badge badge-primary">{document.statut}</span>
              </div>
              {document.date_echeance && (
                <div>
                  <span className="text-xs text-muted block mb-1">Échéance</span>
                  <span className="font-medium">{formatDate(document.date_echeance)}</span>
                </div>
              )}
            </div>
          </div>

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
