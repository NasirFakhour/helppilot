'use client'

import React, { useState, useMemo } from 'react'
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addWeeks, 
  subWeeks,
  startOfDay,
  addHours,
  isToday,
  parseISO
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { Intervention } from '@/lib/types'
import { formatCurrency, fullName } from '@/lib/utils'

interface PlanningCalendarProps {
  initialInterventions: any[]
}

type ViewType = 'day' | 'week'

export function PlanningCalendar({ initialInterventions }: PlanningCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>('week')

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 to 20:00

  const navigate = (direction: number) => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, direction))
    } else {
      setCurrentDate(addDays(currentDate, direction))
    }
  }

  const getInterventionsForDay = (day: Date) => {
    return initialInterventions.filter(i => isSameDay(parseISO(i.date), day))
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'a-planifier': 'bg-gray-500',
      'planifiee': 'bg-indigo-500',
      'en-cours': 'bg-amber-500',
      'terminee': 'bg-emerald-500',
      'facturee': 'bg-blue-500',
      'annulee': 'bg-rose-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgente' || priority === 'haute') return <AlertCircle className="w-3 h-3 text-white" />
    return null
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-1">
            <button 
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-[var(--color-surface)] rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm font-bold hover:bg-[var(--color-surface)] rounded-md transition-colors"
            >
              Aujourd'hui
            </button>
            <button 
              onClick={() => navigate(1)}
              className="p-1.5 hover:bg-[var(--color-surface)] rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-black min-w-[200px]">
            {view === 'week' 
              ? `${format(weekStart, 'd MMMM', { locale: fr })} - ${format(weekEnd, 'd MMMM yyyy', { locale: fr })}`
              : format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
            }
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-1">
            <button 
              onClick={() => setView('day')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${view === 'day' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}
            >
              Jour
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${view === 'week' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}
            >
              Semaine
            </button>
          </div>
          <Link href="/interventions/new" className="btn btn-primary btn-sm ml-2">
            <Plus className="w-4 h-4" />
            Nouveau
          </Link>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex min-w-[800px] h-full">
          {/* Time Gutter */}
          <div className="w-20 flex-shrink-0 border-right border-[var(--color-border)] bg-[var(--color-surface)] sticky left-0 z-20">
            <div className="h-12 border-b border-[var(--color-border)]"></div> {/* Header corner */}
            {hours.map(hour => (
              <div key={hour} className="h-20 flex items-start justify-center pt-2">
                <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {(view === 'week' ? days : [currentDate]).map((day, idx) => {
            const dayInterventions = getInterventionsForDay(day)
            
            return (
              <div key={idx} className="flex-1 min-w-[150px] border-r border-[var(--color-border)] relative">
                {/* Day Header */}
                <div className={`h-12 border-b border-[var(--color-border)] flex flex-col items-center justify-center sticky top-0 z-10 ${isToday(day) ? 'bg-[var(--color-accent-light)]' : 'bg-[var(--color-surface)]'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isToday(day) ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                    {format(day, 'EEE', { locale: fr })}
                  </span>
                  <span className={`text-sm font-bold ${isToday(day) ? 'text-[var(--color-accent)]' : ''}`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Hour Slots */}
                {hours.map(hour => (
                  <div key={hour} className="h-20 border-b border-[var(--color-border-light)] group hover:bg-[var(--color-surface)] transition-colors"></div>
                ))}

                {/* Intervention Blocks */}
                {dayInterventions.map(i => {
                  const hour = parseInt(i.heure?.split(':')[0] || '8')
                  const minute = parseInt(i.heure?.split(':')[1] || '0')
                  const top = ((hour - 8) * 80) + (minute / 60 * 80) + 48 // 48 is header height
                  const height = (i.duree || 60) / 60 * 80

                  return (
                    <Link 
                      key={i.id}
                      href={`/interventions/${i.id}/edit`}
                      className={`absolute left-1 right-1 rounded-lg p-2 overflow-hidden shadow-sm hover:shadow-md transition-all border-l-4 border-white/20 group animate-slide-up ${getStatusColor(i.statut)}`}
                      style={{ top: `${top}px`, height: `${height}px`, zIndex: 5 }}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black text-white/90 uppercase truncate">
                          {i.heure || 'N/A'}
                        </span>
                        {getPriorityIcon(i.priorite)}
                      </div>
                      <div className="font-bold text-xs text-white line-clamp-2 leading-tight mb-1">
                        {fullName(i.clients)}
                      </div>
                      {height > 40 && (
                        <div className="flex items-center gap-1 text-[10px] text-white/80 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {i.adresse || i.clients?.ville || 'Sur site'}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
