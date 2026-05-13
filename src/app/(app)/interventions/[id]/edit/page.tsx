'use client'

import { updateIntervention, deleteIntervention } from '@/app/(app)/actions'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Calendar, Clock, Euro, Tag, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { InterventionEnriched } from '@/components/InterventionEnriched'

export default function EditInterventionPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intervention, setIntervention] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      
      const [invRes, cliRes] = await Promise.all([
        supabase.from('interventions').select('*').eq('id', id).single(),
        supabase.from('clients').select('id, nom, prenom').order('nom', { ascending: true })
      ])

      if (invRes.data) setIntervention(invRes.data)
      else setError('Intervention introuvable')
      
      if (cliRes.data) setClients(cliRes.data)
      
      setInitialLoading(false)
    }
    loadData()
  }, [id])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await updateIntervention(id, formData)
    if (result?.error) {
      toast.error(result.error)
      setError(result.error)
    } else {
      toast.success('Intervention mise à jour')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (confirm("Voulez-vous vraiment supprimer cette intervention ?")) {
      await deleteIntervention(id)
      toast.success('Intervention supprimée')
      router.push('/interventions')
    }
  }

  if (initialLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
        <div className="h-10 bg-[var(--color-border)] rounded w-1/3 mb-8"></div>
        <div className="card h-96"></div>
      </div>
    )
  }

  if (!intervention) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/interventions" className="btn btn-ghost btn-sm -ml-3">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </Link>
        <button type="button" onClick={handleDelete} className="text-danger hover:text-danger-dark font-bold text-xs flex items-center gap-2">
          <Trash2 className="w-3 h-3" />
          Supprimer la mission
        </button>
      </div>

      <div className="page-header items-start mb-8">
        <div className="page-header-left">
          <h1 className="text-3xl font-black">Mission #{intervention.id.slice(0, 8)}</h1>
          <p className="text-lg opacity-60">Gérez les détails techniques et la clôture de cette mission</p>
        </div>
      </div>

      <InterventionEnriched intervention={intervention} clients={clients} />
    </div>
  )
}

