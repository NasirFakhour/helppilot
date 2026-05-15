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

  const getStatusStyles = (status: string) => {
    const styles: Record<string, { bg: string, border: string, text: string }> = {
      'a-planifier': { bg: 'bg-slate-500', border: 'border-slate-400', text: 'text-white' },
      'planifiee':   { bg: 'bg-indigo-600', border: 'border-indigo-400', text: 'text-white' },
      'en-cours':    { bg: 'bg-amber-500',  border: 'border-amber-300',  text: 'text-white' },
      'terminee':    { bg: 'bg-emerald-600', border: 'border-emerald-400', text: 'text-white' },
      'facturee':    { bg: 'bg-sky-600',     border: 'border-sky-400',     text: 'text-white' },
      'annulee':     { bg: 'bg-rose-600',    border: 'border-rose-400',    text: 'text-white' }
    }
    return styles[status] || styles['a-planifier']
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgente' || priority === 'haute') {
      return (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 backdrop-blur-md shadow-sm">
          <AlertCircle className="w-3.5 h-3.5 text-white animate-pulse" />
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
      {/* Calendar Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-3 sm:p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)] gap-3 sm:gap-4">
        {/* Date Navigation */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <div className="flex items-center w-full sm:w-auto bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-1 shadow-sm">
            <button 
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors text-[var(--color-text-secondary)]"
              aria-label="Précédent"
            >
              <ChevronLeft className="w-5 h-5 mx-auto" />
            </button>
            <div className="h-4 w-[1px] bg-[var(--color-border)]"></div>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="flex-[2] sm:flex-none px-4 py-2 text-xs font-bold hover:bg-[var(--color-surface)] rounded-lg transition-colors text-[var(--color-text)]"
            >
              Aujourd'hui
            </button>
            <div className="h-4 w-[1px] bg-[var(--color-border)]"></div>
            <button 
              onClick={() => navigate(1)}
              className="flex-1 sm:flex-none p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors text-[var(--color-text-secondary)]"
              aria-label="Suivant"
            >
              <ChevronRight className="w-5 h-5 mx-auto" />
            </button>
          </div>
          <h2 className="text-base sm:text-xl font-black tracking-tight text-[var(--color-text)] text-center sm:text-left w-full sm:w-auto truncate px-2">
            {view === 'week' 
              ? `${format(weekStart, 'd MMM', { locale: fr })} - ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`
              : format(currentDate, 'EEEE d MMMM', { locale: fr })
            }
          </h2>
        </div>

        {/* View Selection & Action */}
        <div className="flex flex-row items-center gap-2">
          <div className="flex flex-1 sm:flex-none bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-1 shadow-sm">
            <button 
              onClick={() => setView('day')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs font-bold rounded-lg transition-all ${view === 'day' ? 'bg-[var(--color-accent)] text-white shadow-md' : 'hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}
            >
              Jour
            </button>
            <button 
              onClick={() => setView('week')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs font-bold rounded-lg transition-all ${view === 'week' ? 'bg-[var(--color-accent)] text-white shadow-md' : 'hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}
            >
              Semaine
            </button>
          </div>
          <Link href="/interventions/new" className="btn btn-primary h-[40px] px-4 rounded-xl shadow-lg shadow-[var(--color-accent-light)] flex-shrink-0">
            <Plus className="w-5 h-5 sm:mr-1.5" />
            <span className="hidden sm:inline font-bold">Nouveau</span>
          </Link>
        </div>
      </div>

      {/* Calendar Grid Container with horizontal scroll for week view */}
      <div className="flex-1 overflow-auto relative bg-[var(--color-surface)] custom-scrollbar">
        <div className={`flex h-full ${view === 'week' ? 'min-w-[1200px] lg:min-w-full' : 'min-w-full'}`}>
          {/* Time Gutter */}
          <div className="w-14 sm:w-24 flex-shrink-0 border-r-2 border-[var(--color-border)] bg-[var(--color-surface)] sticky left-0 z-30 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="h-16 border-b-2 border-[var(--color-border)] bg-[var(--color-surface)]"></div>
            {hours.map(hour => (
              <div key={hour} className="h-[100px] flex items-start justify-center pt-4">
                <span className="text-[10px] sm:text-xs font-black text-[var(--color-text-muted)] uppercase tracking-wider">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {(view === 'week' ? days : [currentDate]).map((day, idx) => {
            const dayInterventions = getInterventionsForDay(day)
            
            return (
              <div key={idx} className={`flex-1 min-w-[180px] sm:min-w-[140px] border-r-2 border-[var(--color-border)] relative ${isToday(day) ? 'bg-[var(--color-accent-light)]/10' : ''}`}>
                {/* Day Header */}
                <div className={`h-16 border-b-2 border-[var(--color-border)] flex flex-col items-center justify-center sticky top-0 z-20 backdrop-blur-md transition-colors ${isToday(day) ? 'bg-[var(--color-accent-light)]/80 text-[var(--color-accent)]' : 'bg-[var(--color-surface)]/90 text-[var(--color-text)]'}`}>
                  <span className={`text-[9px] sm:text-[11px] font-black uppercase tracking-widest mb-0.5 ${isToday(day) ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                    {format(day, 'EEEE', { locale: fr })}
                  </span>
                  <span className={`text-sm sm:text-lg font-black ${isToday(day) ? 'text-[var(--color-accent)]' : ''}`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Hour Slots */}
                {hours.map(hour => (
                  <div key={hour} className="h-[100px] border-b border-[var(--color-border)]/60 group hover:bg-[var(--color-accent-light)]/5 transition-colors"></div>
                ))}

                {/* Intervention Blocks */}
                {dayInterventions.map(i => {
                  const hour = parseInt(i.heure?.split(':')[0] || '8')
                  const minute = parseInt(i.heure?.split(':')[1] || '0')
                  const hourHeight = 100
                  const headerHeight = 64
                  const top = ((hour - 8) * hourHeight) + (minute / 60 * hourHeight) + headerHeight
                  const height = Math.max((i.duree || 60) / 60 * hourHeight, 70) // Slightly taller min height

                  const styles = getStatusStyles(i.statut)

                  return (
                    <Link 
                      key={i.id}
                      href={`/interventions/${i.id}/edit`}
                      className={`absolute left-2 right-2 rounded-xl p-3 overflow-hidden shadow-md hover:shadow-xl transition-all border-l-[6px] group animate-slide-up flex flex-col justify-between ${styles.bg} ${styles.text} border-white/30 hover:scale-[1.02] active:scale-[0.98]`}
                      style={{ top: `${top + 4}px`, height: `${height - 8}px`, zIndex: 10 }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/10 backdrop-blur-sm">
                            <Clock className="w-3.5 h-3.5 text-white flex-shrink-0" />
                            <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-tighter">
                              {i.heure || 'N/A'}
                            </span>
                          </div>
                          {getPriorityIcon(i.priorite)}
                        </div>
                        <div className="font-extrabold text-xs sm:text-sm text-white truncate sm:line-clamp-2 leading-tight mb-2 drop-shadow-sm">
                          {fullName(i.clients)}
                        </div>
                      </div>
                      
                      {(height > 85) && (
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/90 font-medium truncate mt-auto bg-black/10 p-1.5 rounded-lg backdrop-blur-[2px]">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{i.adresse || i.clients?.ville || 'Sur site'}</span>
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
