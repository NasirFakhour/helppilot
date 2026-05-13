import { createClient } from '@/utils/supabase/server'
import { PlanningCalendar } from '@/components/PlanningCalendar'

export default async function PlanningPage() {
  const supabase = await createClient()
  
  const { data: interventions } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .order('date', { ascending: true })

  return (
    <div className="animate-fade-in h-[calc(100vh-var(--topbar-height)-var(--space-12))] flex flex-col">
      <div className="page-header mb-4">
        <div className="page-header-left">
          <h1>Planning</h1>
          <p>Gérez vos interventions et vos tournées</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <PlanningCalendar initialInterventions={interventions || []} />
      </div>
    </div>
  )
}
