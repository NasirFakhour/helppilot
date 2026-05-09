import { createClient } from '@/utils/supabase/server'
import { InterventionList } from '@/components/lists/InterventionList'

export default async function InterventionsPage() {
  const supabase = await createClient()
  
  const { data: interventions } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .order('date', { ascending: false })

  return <InterventionList initialInterventions={interventions || []} />
}
