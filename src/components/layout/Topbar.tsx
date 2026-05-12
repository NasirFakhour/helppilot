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
    <header className="topbar">
      <div className="topbar-left">
        <button 
          id="menu-toggle" 
          className="btn-icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="topbar-mobile-brand">
          <span className="font-bold tracking-tight text-lg">TechniSuivi</span>
        </div>
      </div>

      <div className="topbar-actions">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="topbar-theme-btn"
            aria-label="Changer le thème"
          >
            {theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>
        )}
        
        <Link href="/interventions/new" className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle mission</span>
          <span className="sm:hidden">Mission</span>
        </Link>
      </div>
    </header>
  )
}

