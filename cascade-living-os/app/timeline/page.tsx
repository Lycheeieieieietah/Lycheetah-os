'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

// ============================================================================
// TYPES
// ============================================================================

interface TimelineEvent {
  id: string
  type: 'microorcim' | 'journal' | 'focus' | 'ritual' | 'goal' | 'commitment' | 'decision' | 'memory' | 'gratitude' | 'energy' | 'sleep' | 'breath' | 'capture'
  title: string
  description?: string
  timestamp: number
  lamague?: string
  metadata?: Record<string, any>
}

// ============================================================================
// EVENT CARD
// ============================================================================

function EventCard({ event }: { event: TimelineEvent }) {
  const config: Record<string, { icon: string; color: string; link: string }> = {
    microorcim: { icon: '⚡', color: 'cyan', link: '/microorcim' },
    journal: { icon: '📝', color: 'amber', link: '/journal' },
    focus: { icon: '🎯', color: 'purple', link: '/focus' },
    ritual: { icon: '🔄', color: 'emerald', link: '/rituals' },
    goal: { icon: '🏆', color: 'pink', link: '/goals' },
    commitment: { icon: '✓', color: 'blue', link: '/commitments' },
    decision: { icon: '❓', color: 'amber', link: '/decisions' },
    memory: { icon: '🧠', color: 'purple', link: '/memory' },
    gratitude: { icon: '✧', color: 'yellow', link: '/gratitude' },
    energy: { icon: '🔋', color: 'green', link: '/energy' },
    sleep: { icon: '🌙', color: 'indigo', link: '/sleep' },
    breath: { icon: '💨', color: 'teal', link: '/breathe' },
    capture: { icon: '💭', color: 'zinc', link: '/today' }
  }
  
  const { icon, color, link } = config[event.type] || { icon: '•', color: 'zinc', link: '/' }
  
  const time = new Date(event.timestamp)
  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  
  return (
    <div className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full bg-${color}-500/20 flex items-center justify-center text-lg flex-shrink-0`}>
          {icon}
        </div>
        <div className="w-0.5 flex-1 bg-zinc-800 mt-2" />
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-8">
        <Link href={link}>
          <div className={`cascade-card p-4 hover:border-${color}-500/30 transition-all`}>
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs text-${color}-400`}>{event.type}</span>
                {event.lamague && (
                  <span className="font-mono text-purple-400 text-sm">{event.lamague}</span>
                )}
              </div>
              <span className="text-xs text-zinc-600">{timeStr}</span>
            </div>
            <h3 className="font-medium text-zinc-200 mb-1">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-zinc-500 line-clamp-2">{event.description}</p>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}

// ============================================================================
// DAY HEADER
// ============================================================================

function DayHeader({ date, eventCount }: { date: string; eventCount: number }) {
  const d = new Date(date)
  const isToday = d.toDateString() === new Date().toDateString()
  const isYesterday = d.toDateString() === new Date(Date.now() - 86400000).toDateString()
  
  const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
  
  return (
    <div className="flex items-center gap-4 mb-4 mt-8 first:mt-0">
      <h2 className="text-lg font-medium text-zinc-200">{label}</h2>
      <div className="flex-1 h-px bg-zinc-800" />
      <span className="text-sm text-zinc-600">{eventCount} events</span>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  
  // Load all events
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    setLoading(true)
    const allEvents: TimelineEvent[] = []
    
    // Microorcims
    const microorcims = JSON.parse(localStorage.getItem('cascade-microorcims') || '[]')
    microorcims.forEach((m: any) => {
      allEvents.push({
        id: m.id || `mu-${m.timestamp}`,
        type: 'microorcim',
        title: m.description || 'Microorcim fired',
        timestamp: m.timestamp,
        lamague: m.lamague,
        metadata: { intent: m.intent, drift: m.drift }
      })
    })
    
    // Journal entries
    const journal = JSON.parse(localStorage.getItem('cascade-journal') || '[]')
    journal.forEach((j: any) => {
      allEvents.push({
        id: j.id || `j-${j.timestamp}`,
        type: 'journal',
        title: j.title || 'Journal Entry',
        description: j.content?.substring(0, 100),
        timestamp: j.timestamp,
        lamague: j.lamague
      })
    })
    
    // Focus sessions
    const focus = JSON.parse(localStorage.getItem('cascade-focus-sessions') || '[]')
    focus.forEach((f: any) => {
      allEvents.push({
        id: f.id || `f-${f.startTime}`,
        type: 'focus',
        title: f.intent || 'Focus Session',
        description: `${f.duration} minutes`,
        timestamp: f.startTime,
        lamague: '⟟'
      })
    })
    
    // Rituals completed (from ritual completions in rituals data)
    const rituals = JSON.parse(localStorage.getItem('cascade-rituals') || '[]')
    rituals.forEach((r: any) => {
      r.completions?.forEach((c: number) => {
        allEvents.push({
          id: `r-${r.id}-${c}`,
          type: 'ritual',
          title: `${r.name} completed`,
          timestamp: c,
          lamague: r.lamague
        })
      })
    })
    
    // Gratitude
    const gratitude = JSON.parse(localStorage.getItem('cascade-gratitude') || '[]')
    gratitude.forEach((g: any) => {
      allEvents.push({
        id: g.id,
        type: 'gratitude',
        title: 'Gratitude logged',
        description: g.items?.slice(0, 2).join(', '),
        timestamp: g.timestamp,
        lamague: '✧'
      })
    })
    
    // Energy logs
    const energy = JSON.parse(localStorage.getItem('cascade-energy-logs') || '[]')
    energy.forEach((e: any) => {
      allEvents.push({
        id: `e-${e.timestamp}`,
        type: 'energy',
        title: `Energy: ${e.energy}/5, Mood: ${e.mood}/5`,
        description: e.note,
        timestamp: e.timestamp,
        lamague: '≋'
      })
    })
    
    // Sleep
    const sleep = JSON.parse(localStorage.getItem('cascade-sleep') || '[]')
    sleep.forEach((s: any) => {
      allEvents.push({
        id: s.id,
        type: 'sleep',
        title: `Slept ${s.duration?.toFixed(1)}h`,
        description: `${s.bedtime} → ${s.waketime}`,
        timestamp: s.timestamp,
        lamague: '⟟'
      })
    })
    
    // Breath sessions
    const breath = JSON.parse(localStorage.getItem('cascade-breath-sessions') || '[]')
    breath.forEach((b: any) => {
      allEvents.push({
        id: b.id,
        type: 'breath',
        title: 'Breathwork completed',
        description: `${Math.round(b.duration / 60)} minutes`,
        timestamp: b.timestamp,
        lamague: '⟟'
      })
    })
    
    // Quick captures
    const captures = JSON.parse(localStorage.getItem('cascade-quick-captures') || '[]')
    captures.forEach((c: any) => {
      allEvents.push({
        id: c.id,
        type: 'capture',
        title: `${c.type}: ${c.content?.substring(0, 40)}...`,
        description: c.content,
        timestamp: c.timestamp
      })
    })
    
    // Sort by timestamp descending
    allEvents.sort((a, b) => b.timestamp - a.timestamp)
    setEvents(allEvents)
    setLoading(false)
  }, [])
  
  // Group events by day
  const groupedEvents = useMemo(() => {
    const filtered = filter === 'all' 
      ? events 
      : events.filter(e => e.type === filter)
    
    const groups: Record<string, TimelineEvent[]> = {}
    
    filtered.forEach(event => {
      const date = new Date(event.timestamp).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(event)
    })
    
    return groups
  }, [events, filter])
  
  const eventTypes = ['all', 'microorcim', 'journal', 'focus', 'ritual', 'gratitude', 'energy', 'sleep', 'breath', 'capture']
  
  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-48" />
          <div className="h-24 bg-zinc-800 rounded" />
          <div className="h-24 bg-zinc-800 rounded" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Timeline</h1>
        <p className="text-zinc-500">Your CASCADE journey, moment by moment</p>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{events.length}</p>
          <p className="text-xs text-zinc-500">Total Events</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{Object.keys(groupedEvents).length}</p>
          <p className="text-xs text-zinc-500">Days Active</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">
            {events.length > 0 ? Math.round(events.length / Math.max(Object.keys(groupedEvents).length, 1)) : 0}
          </p>
          <p className="text-xs text-zinc-500">Avg/Day</p>
        </div>
      </div>
      
      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {eventTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
              filter === type
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Timeline */}
      {events.length === 0 ? (
        <div className="cascade-card p-12 text-center">
          <p className="text-4xl mb-4">📜</p>
          <p className="text-zinc-400">No events yet</p>
          <p className="text-sm text-zinc-600">Start using CASCADE and your timeline will fill</p>
        </div>
      ) : (
        <div>
          {Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div key={date}>
              <DayHeader date={date} eventCount={dayEvents.length} />
              {dayEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
