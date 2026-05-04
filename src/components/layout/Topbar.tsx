'use client'

import { Menu, Plus, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface TopbarProps {
  setSidebarOpen: (isOpen: boolean) => void
}

export function Topbar({ setSidebarOpen }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="topbar bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-40 border-b border-border-light dark:border-white/5 h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          id="menu-toggle" 
          className="btn-icon md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:block">
          <span className="text-sm font-bold text-muted uppercase tracking-widest">Espace de travail</span>
        </div>
        <div className="md:hidden">
          <span className="font-black tracking-tight text-xl">HelpPilot</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface transition-colors"
            aria-label="Changer le thème"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-500" />
            )}
          </button>
        )}
        
        <Link href="/interventions/new" className="btn btn-primary btn-sm px-4">
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Nouvelle mission</span>
          <span className="sm:hidden">Mission</span>
        </Link>
      </div>
    </header>
  )
}

