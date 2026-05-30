import { createClient } from '@/utils/supabase/server'
import { PlanningCalendar } from '@/components/PlanningCalendar'
import Card from '@/components/ui/Card'

export default async function PlanningPage() {
  const supabase = await createClient()
  
  const { data: interventions } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .order('date', { ascending: true })

  return (
    <div className="animate-fade-in h-[calc(100vh-var(--topbar-height)-var(--space-12))] flex flex-col">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="text-3xl font-bold tracking-tight">Planning</h1>
          <p className="text-secondary">Gérez vos interventions et vos tournées</p>
        </div>
      </div>
      
      <Card className="p-6 flex-1 min-h-0">
        <PlanningCalendar initialInterventions={interventions || []} />
      </Card>
    </div>
  )
}
