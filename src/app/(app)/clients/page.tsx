import { createClient } from '@/utils/supabase/server'
import { ClientList } from '@/components/lists/ClientList'

export default async function ClientsPage() {
  const supabase = await createClient()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('nom', { ascending: true })

  return <ClientList initialClients={clients || []} />
}
