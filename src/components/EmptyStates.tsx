'use client'

import { useState } from 'react'
import { generateDemoData } from '@/app/(app)/actions'
import { Database, Plus, Sparkles, Inbox } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export function EmptyStateDashboard() {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    const res = await generateDemoData()
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Données de démonstration chargées')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in max-w-2xl mx-auto">
      <div className="w-20 h-20 rounded-[24px] bg-[var(--color-primary-light)] flex items-center justify-center mb-8 shadow-sm border border-[var(--color-border-light)]">
        <Inbox className="w-10 h-10 text-[var(--color-accent)]" />
      </div>
      
      <h2 className="text-3xl font-black tracking-tight mb-3">Prêt à décoller ?</h2>
      <p className="text-[var(--color-text-secondary)] text-lg mb-10 leading-relaxed">
        Votre espace de travail est prêt. Commencez par ajouter vos premiers clients ou chargez les données de démonstration pour explorer l'interface.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link href="/clients/new" className="btn btn-primary btn-lg">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Client
        </Link>
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="btn btn-secondary btn-lg group"
        >
          <Sparkles className="w-5 h-5 mr-2 text-warning group-hover:animate-pulse" />
          {loading ? 'Chargement...' : "Explorer la démo"}
        </button>
      </div>
    </div>
  )
}
