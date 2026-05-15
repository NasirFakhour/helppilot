'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addWeeks, 
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
  Search,
  LayoutList,
  CalendarDays,
  ArrowRight,
  AlertTriangle,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { fullName } from '@/lib/utils'

interface PlanningCalendarProps {
  initialInterventions: any[]
}

type ViewType = 'day' | 'week' | 'agenda'

export function PlanningCalendar({ initialInterventions }: PlanningCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>('week')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Simulation de chargement pour fluidité
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // Adaptation responsive automatique au montage
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        if (view === 'week') setView('agenda')
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [view])

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 to 20:00

  // Logique de filtrage
  const filteredInterventions = useMemo(() => {
    return initialInterventions.filter(i => {
      const clientName = fullName(i.clients).toLowerCase()
      const desc = (i.description || '').toLowerCase()
      const search = searchTerm.toLowerCase()
      
      const matchesSearch = searchTerm === '' || clientName.includes(search) || desc.includes(search)
      const matchesStatus = statusFilter === 'all' || i.statut === statusFilter
      const matchesPriority = priorityFilter === 'all' || i.priorite === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [initialInterventions, searchTerm, statusFilter, priorityFilter])

  const navigate = (direction: number) => {
    if (view === 'week' || view === 'agenda') {
      setCurrentDate(addWeeks(currentDate, direction))
    } else {
      setCurrentDate(addDays(currentDate, direction))
    }
  }

  const getInterventionsForDay = (day: Date) => {
    return filteredInterventions.filter(i => isSameDay(parseISO(i.date), day))
  }

  const getStatusStyles = (status: string) => {
    const styles: Record<string, { bg: string, text: string, dot: string }> = {
      'a-planifier': { bg: 'bg-slate-500', text: 'text-white', dot: 'bg-slate-400' },
      'planifiee':   { bg: 'bg-indigo-600', text: 'text-white', dot: 'bg-indigo-300' },
      'en-cours':    { bg: 'bg-amber-500',  text: 'text-white', dot: 'bg-amber-200' },
      'terminee':    { bg: 'bg-emerald-600', text: 'text-white', dot: 'bg-emerald-300' },
      'facturee':    { bg: 'bg-sky-600',     text: 'text-white', dot: 'bg-sky-300' },
      'annulee':     { bg: 'bg-rose-600',    text: 'text-white', dot: 'bg-rose-300' }
    }
    return styles[status] || styles['a-planifier']
  }

  const getPriorityTag = (priority: string) => {
    switch(priority) {
      case 'urgente': return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'haute':   return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'normale': return 'bg-blue-100 text-blue-700 border-blue-200'
      default:        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 animate-pulse overflow-hidden">
        <div className="h-20 bg-slate-50 border-b border-slate-200"></div>
        <div className="flex-1 p-6 space-y-4">
          <div className="h-32 bg-slate-50 rounded-2xl"></div>
          <div className="h-32 bg-slate-50 rounded-2xl"></div>
          <div className="h-32 bg-slate-50 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
      
      {/* ══ HEADER PROFESSIONNEL ══ */}
      <div className="flex flex-col bg-white">
        
        {/* Navigation & Titre */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-4 lg:p-6 gap-6 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
              <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600 active:scale-95"><ChevronLeft className="w-5 h-5"/></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 text-xs font-black text-slate-800 hover:bg-white hover:shadow-md rounded-xl transition-all uppercase tracking-widest">Aujourd'hui</button>
              <button onClick={() => navigate(1)} className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600 active:scale-95"><ChevronRight className="w-5 h-5"/></button>
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-slate-900 leading-none mb-1">
                {view === 'agenda' ? 'Mon Agenda' : format(currentDate, 'MMMM yyyy', { locale: fr })}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest opacity-70 hidden sm:block">
                {format(weekStart, 'd MMMM', { locale: fr })} — {format(weekEnd, 'd MMMM', { locale: fr })}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 w-full sm:w-auto">
              <button onClick={() => setView('agenda')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === 'agenda' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                <LayoutList className="w-4 h-4"/> Agenda
              </button>
              <button onClick={() => setView('week')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest hidden lg:flex ${view === 'week' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                <CalendarDays className="w-4 h-4"/> Semaine
              </button>
            </div>
            <Link href="/interventions/new" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto">
              <Plus className="w-5 h-5"/> <span>Nouveau</span>
            </Link>
          </div>
        </div>

        {/* Filtres & Recherche */}
        <div className="flex flex-col lg:flex-row items-center gap-4 p-4 lg:px-6 lg:py-4 bg-slate-50/40">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
            <input 
              type="text" 
              placeholder="Rechercher un client, une adresse..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <select 
              className="flex-1 lg:w-48 pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 outline-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 shadow-sm uppercase tracking-widest appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="planifiee">À venir</option>
              <option value="en-cours">En cours</option>
              <option value="terminee">Terminées</option>
            </select>
            <select 
              className="flex-1 lg:w-48 pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 outline-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 shadow-sm uppercase tracking-widest appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">Priorités</option>
              <option value="urgente">Urgent</option>
              <option value="haute">Haute</option>
              <option value="normale">Normale</option>
            </select>
          </div>
        </div>
      </div>

      {/* ══ ZONE DE CONTENU ══ */}
      <div className="flex-1 overflow-hidden">
        
        {/* VUE DESKTOP (GRILLE SEMAINE) */}
        {view === 'week' && (
          <div className="h-full flex flex-col overflow-auto custom-scrollbar bg-slate-50/20">
            <div className="flex min-w-[1400px] h-full">
              {/* Colonne des heures */}
              <div className="w-24 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-30 shadow-2xl shadow-slate-200/50">
                <div className="h-16 border-b border-slate-200"></div>
                {hours.map(hour => (
                  <div key={hour} className="h-[140px] border-b border-slate-100 flex items-start justify-center pt-5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{hour}:00</span>
                  </div>
                ))}
              </div>

              {/* Colonnes des jours */}
              {days.map((day, dIdx) => {
                const dayIv = getInterventionsForDay(day)
                return (
                  <div key={dIdx} className={`flex-1 border-r border-slate-100 relative group ${isToday(day) ? 'bg-indigo-50/40' : 'bg-white'}`}>
                    {/* Header du jour */}
                    <div className={`h-16 border-b-2 flex flex-col items-center justify-center sticky top-0 z-20 backdrop-blur-xl transition-all ${isToday(day) ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg' : 'bg-white/90 text-slate-900 border-slate-200'}`}>
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${isToday(day) ? 'text-white/80' : 'text-slate-400'}`}>
                        {format(day, 'EEEE', { locale: fr })}
                      </span>
                      <span className="text-xl font-black leading-none">
                        {format(day, 'd')}
                      </span>
                    </div>

                    {/* Slots horaires */}
                    {hours.map(h => <div key={h} className="h-[140px] border-b border-slate-50 transition-colors"></div>)}

                    {/* Cartes d'interventions */}
                    {dayIv.map(iv => {
                      const hour = parseInt(iv.heure?.split(':')[0] || '8')
                      const minute = parseInt(iv.heure?.split(':')[1] || '0')
                      const top = ((hour - 8) * 140) + (minute / 60 * 140) + 64
                      const height = Math.max((iv.duree || 60) / 60 * 140, 90)
                      const st = getStatusStyles(iv.statut)

                      return (
                        <Link 
                          key={iv.id}
                          href={`/interventions/${iv.id}/edit`}
                          className={`absolute left-3 right-3 rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border-l-[8px] z-10 flex flex-col justify-between overflow-hidden ${st.bg} ${st.text} border-white/20`}
                          style={{ top: `${top + 8}px`, height: `${height - 16}px` }}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/15 text-[11px] font-black uppercase tracking-tighter backdrop-blur-sm">
                                <Clock className="w-3.5 h-3.5"/> {iv.heure || '08:00'}
                              </div>
                              {iv.priorite === 'urgente' && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase animate-pulse">
                                  <AlertTriangle className="w-3 h-3"/> Urgent
                                </div>
                              )}
                            </div>
                            <div className="font-black text-sm lg:text-base leading-tight line-clamp-2 mb-1.5 uppercase tracking-tight">
                              {fullName(iv.clients)}
                            </div>
                            <div className="text-[11px] font-bold opacity-90 line-clamp-2 mb-3 leading-relaxed">
                              {iv.description || 'Intervention technique standard'}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-auto bg-white/15 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <MapPin className="w-4 h-4 flex-shrink-0 opacity-80"/>
                            <span className="text-[11px] font-bold truncate tracking-tight">{iv.adresse || iv.clients?.ville || 'Sur site'}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* VUE MOBILE / AGENDA (LISTE VERTICALE) */}
        {view === 'agenda' && (
          <div className="h-full overflow-auto bg-slate-50 p-4 lg:p-8 space-y-10 custom-scrollbar">
            {days.map((day, dIdx) => {
              const dayIv = getInterventionsForDay(day)
              if (dayIv.length === 0 && !isToday(day)) return null

              return (
                <div key={dIdx} className="space-y-6">
                  <div className="flex items-center gap-4 sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xl py-4">
                    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-3xl shadow-xl ${isToday(day) ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
                      <span className="text-[10px] font-black uppercase leading-none mb-1.5 tracking-widest">{format(day, 'EEE', { locale: fr })}</span>
                      <span className="text-xl font-black leading-none">{format(day, 'd')}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg lg:text-xl capitalize">{format(day, 'EEEE d MMMM', { locale: fr })}</h3>
                      <p className="text-xs text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        {dayIv.length} {dayIv.length > 1 ? 'missions prévues' : 'mission prévue'}
                      </p>
                    </div>
                    {isToday(day) && (
                      <div className="ml-auto bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200">
                        Aujourd'hui
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayIv.length > 0 ? dayIv.map(iv => {
                      const st = getStatusStyles(iv.statut)
                      return (
                        <Link key={iv.id} href={`/interventions/${iv.id}/edit`} className="group">
                          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm group-hover:shadow-2xl group-hover:border-indigo-200 group-active:scale-[0.98] transition-all duration-300 relative overflow-hidden">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center ${st.bg} text-white shadow-2xl shadow-slate-200 group-hover:rotate-6 transition-transform`}>
                                  <Clock className="w-7 h-7"/>
                                </div>
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{iv.heure || '08:00'}</span>
                                    <span className={`px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getPriorityTag(iv.priorite)}`}>
                                      {iv.priorite}
                                    </span>
                                  </div>
                                  <h4 className="font-black text-xs text-slate-500 uppercase tracking-widest">{fullName(iv.clients)}</h4>
                                </div>
                              </div>
                              <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"/>
                            </div>

                            <div className="space-y-4 mb-6">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0"/>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{iv.adresse || iv.clients?.adresse || iv.clients?.ville || 'Sur site client'}</p>
                              </div>
                              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0"/>
                                <p className="text-sm text-slate-500 font-semibold line-clamp-2 leading-relaxed italic">"{iv.description || 'Aucune consigne particulière.'}"</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-3 h-3 rounded-full ${st.dot} shadow-inner`}></div>
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{iv.statut}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                                Détails <ChevronRight className="w-4 h-4"/>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    }) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-16 border-4 border-dashed border-slate-100 rounded-[3rem] bg-white/50 text-center">
                        <CalendarIcon className="w-16 h-16 text-slate-100 mb-4"/>
                        <p className="text-base font-black text-slate-300 uppercase tracking-[0.2em]">Aucune mission ce jour</p>
                        <Link href="/interventions/new" className="mt-6 flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                          <Plus className="w-4 h-4"/> Planifier une mission
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ÉTAT VIDE (FILTRES) */}
        {filteredInterventions.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full p-10 text-center bg-slate-50">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-slate-200 mb-8 rotate-12">
              <Search className="w-12 h-12 text-slate-200 -rotate-12"/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Aucun résultat trouvé</h3>
            <p className="text-slate-500 max-w-sm mb-10 font-medium leading-relaxed">
              Nous n'avons trouvé aucune intervention correspondant à votre recherche ou à vos filtres actuels.
            </p>
            <button 
              onClick={() => {setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all')}}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
