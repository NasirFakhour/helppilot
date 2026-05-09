import { createClient } from '@/utils/supabase/server'
import { DocumentList } from '@/components/lists/DocumentList'

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const activeTab = resolvedSearchParams.type === 'facture' ? 'facture' : 'devis'
  
  const { data: documents } = await supabase
    .from('documents')
    .select('*, clients(*)')
    .eq('type', activeTab)
    .order('created_at', { ascending: false })

  return <DocumentList initialDocuments={documents || []} defaultTab={activeTab} />
}
