'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  BellRing, 
  Settings, 
  LogOut,
  X,
  CalendarDays,
  FileText
} from 'lucide-react'
import { logout } from '@/app/(auth)/actions'

function TechniSuiviLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
        <rect width="120" height="120" rx="36" fill="#1E293B"/>
        <path d="M38 46C38 42.6863 40.6863 40 44 40H76C79.3137 40 82 42.6863 82 46V50C82 53.3137 79.3137 56 76 56H64V80C64 83.3137 61.3137 86 58 86H56C52.6863 86 50 83.3137 50 80V56H44C40.6863 56 38 53.3137 38 50V46Z" fill="white"/>
        <circle cx="78" cy="72" r="7" fill="white"/>
      </svg>
      {!collapsed && <span className="logo-text">TechniSuivi</span>}
    </div>
  )
}

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/planning', label: 'Planning', icon: CalendarDays },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/interventions', label: 'Interventions', icon: CalendarDays },
    { href: '/documents', label: 'Devis & Factures', icon: FileText },
    { href: '/relances', label: 'Relances', icon: BellRing },
    { href: '/settings', label: 'Paramètres', icon: Settings },
  ]

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? '' : 'hidden'}`} 
        onClick={() => setIsOpen(false)}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">
            <TechniSuiviLogo />
          </Link>
          <button 
            className="sidebar-close btn-icon" 
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sidebar-section-label">Menu principal</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <div className="nav-item-icon">
                  <Icon />
                </div>
                <span className="nav-item-label">{item.label}</span>
                {isActive && <div className="nav-active-indicator" />}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">U</div>
            <div className="user-details">
              <div className="user-name">Mon Compte</div>
              <div className="user-role">Technicien</div>
            </div>
          </div>
          <button id="logout-btn" className="btn-icon" onClick={() => logout()} title="Déconnexion">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>
    </>
  )
}
