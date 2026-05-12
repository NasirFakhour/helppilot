'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { HelpCircle } from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="main-wrapper">
        <Topbar setSidebarOpen={setSidebarOpen} />
        
        <main className="page-content">
          {children}
        </main>
      </div>

      <a href="mailto:support@technisuivi.fr?subject=Besoin d'aide" className="btn-help" title="Besoin d'aide ?">
        <HelpCircle />
      </a>
    </div>
  )
}
