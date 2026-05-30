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
      <Header>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planning</h1>
            <p className="text-secondary">Gérez vos interventions et vos tournées</p>
          </div>
        </div>
      </Header>
      
      <Card className="p-6 flex-1 min-h-0">
        <PlanningCalendar initialInterventions={interventions || []} />
      </Card>
    </div>
  )
}
