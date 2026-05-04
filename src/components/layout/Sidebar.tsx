'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  BellRing, 
  Settings, 
  LogOut,
  X
} from 'lucide-react'
import { logout } from '@/app/(auth)/actions'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/clients', label: 'Clients', icon: Users },
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
            <div className="logo-icon">HP</div>
            <span className="logo-text">HelpPilot</span>
          </Link>
          <button 
            className="sidebar-close btn-icon" 
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                <Icon />
                {item.label}
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
          <button id="logout-btn" className="btn-icon" onClick={() => logout()}>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>
    </>
  )
}
