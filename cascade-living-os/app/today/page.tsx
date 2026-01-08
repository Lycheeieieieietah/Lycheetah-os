'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ============================================================================
// TYPES
// ============================================================================

interface TodayStats {
  microorcimsFired: number
  microorcimsAttempted: number
  focusMinutes: number
  focusSessions: number
  ritualsCompleted: number
  ritualsTotal: number
  journalWritten: boolean
  capturesUnprocessed: number
}

interface QuickCapture {
  id: string
  type: string
  content: string
  timestamp: number
  processed: boolean
}

interface FocusSession {
  id: string
  startTime: number
  endTime?: number
  completed: boolean
  intent: string
}

// ============================================================================
// GREETING
// ============================================================================

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'Deep night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function getPhaseGlyph(): { glyph: string; name: string; day: number } {
  const cycleStart = new Date('2025-01-01')
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) % 364
  const phaseIndex = Math.floor(dayOfYear / 52)
  const dayInPhase = (dayOfYear % 52) + 1
  
  const phases = [
    { glyph: '⟟', name: 'Center' },
    { glyph: '≋', name: 'Flow' },
    { glyph: 'Ψ', name: 'Insight' },
    { glyph: 'Φ↑', name: 'Rise' },
    { glyph: '✧', name: 'Light' },
    { glyph: '∥◁▷∥', name: 'Integrity' },
    { glyph: '⟲', name: 'Return' }
  ]
  
  return { ...phases[phaseIndex], day: dayInPhase }
}

// ============================================================================
// TODAY WIDGET
// ============================================================================

function TodayWidget({ 
  title, 
  icon, 
  value, 
  subtitle, 
  color,
  href
}: { 
  title: string
  icon: string
  value: string | number
  subtitle: string
  color: string
  href?: string
}) {
  const content = (
    <div className={`cascade-card p-4 hover:border-${color}-500/30 transition-all ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-zinc-500">{title}</span>
      </div>
      <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
    </div>
  )
  
  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

// ============================================================================
// QUICK ACTION
// ============================================================================

function QuickAction({
  icon,
  label,
  onClick,
  color = 'cyan'
}: {
  icon: string
  label: string
  onClick: () => void
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-${color}-500/10 hover:bg-${color}-500/20 text-${color}-400 rounded-lg transition-colors`}
    >
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TodayPage() {
  const [stats, setStats] = useState<TodayStats>({
    microorcimsFired: 0,
    microorcimsAttempted: 0,
    focusMinutes: 0,
    focusSessions: 0,
    ritualsCompleted: 0,
    ritualsTotal: 0,
    journalWritten: false,
    capturesUnprocessed: 0
  })
  const [captures, setCaptures] = useState<QuickCapture[]>([])
  const [mounted, setMounted] = useState(false)
  
  const phase = getPhaseGlyph()
  const greeting = getGreeting()
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  })
  
  // Load data from various localStorage keys
  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const todayStr = new Date().toDateString()
      
      // Microorcims
      const microorcims = JSON.parse(localStorage.getItem('cascade-microorcims') || '[]')
      const todayMicroorcims = microorcims.filter((m: any) => 
        new Date(m.timestamp).toDateString() === todayStr
      )
      
      // Focus sessions
      const focusSessions = JSON.parse(localStorage.getItem('cascade-focus-sessions') || '[]')
      const todayFocus = focusSessions.filter((s: FocusSession) => 
        new Date(s.startTime).toDateString() === todayStr
      )
      const focusMins = todayFocus.reduce((sum: number, s: FocusSession) => {
        if (s.endTime) {
          return sum + (s.endTime - s.startTime) / 1000 / 60
        }
        return sum
      }, 0)
      
      // Rituals
      const rituals = JSON.parse(localStorage.getItem('cascade-rituals') || '[]')
      const activeRituals = rituals.filter((r: any) => r.active && r.frequency === 'daily')
      const completedRituals = activeRituals.filter((r: any) => {
        const todayCompletions = (r.completions || []).filter((c: any) => 
          new Date(c.timestamp).toDateString() === todayStr
        )
        return todayCompletions.length >= r.targetCount
      })
      
      // Journal
      const journal = JSON.parse(localStorage.getItem('cascade-journal') || '[]')
      const todayEntry = journal.some((e: any) => 
        new Date(e.timestamp).toDateString() === todayStr
      )
      
      // Quick captures
      const quickCaptures = JSON.parse(localStorage.getItem('cascade-quick-captures') || '[]')
      const unprocessed = quickCaptures.filter((c: QuickCapture) => !c.processed)
      
      setCaptures(unprocessed.slice(0, 5))
      
      setStats({
        microorcimsFired: todayMicroorcims.filter((m: any) => m.fired).length,
        microorcimsAttempted: todayMicroorcims.length,
        focusMinutes: Math.round(focusMins),
        focusSessions: todayFocus.filter((s: FocusSession) => s.completed).length,
        ritualsCompleted: completedRituals.length,
        ritualsTotal: activeRituals.length,
        journalWritten: todayEntry,
        capturesUnprocessed: unprocessed.length
      })
    }
  }, [])
  
  const processCapture = (id: string) => {
    const all = JSON.parse(localStorage.getItem('cascade-quick-captures') || '[]')
    const updated = all.map((c: QuickCapture) => 
      c.id === id ? { ...c, processed: true } : c
    )
    localStorage.setItem('cascade-quick-captures', JSON.stringify(updated))
    setCaptures(prev => prev.filter(c => c.id !== id))
    setStats(prev => ({ ...prev, capturesUnprocessed: prev.capturesUnprocessed - 1 }))
  }
  
  // Calculate overall day score
  const dayScore = mounted ? Math.round(
    ((stats.microorcimsFired / Math.max(stats.microorcimsAttempted, 1)) * 25) +
    ((stats.ritualsCompleted / Math.max(stats.ritualsTotal, 1)) * 25) +
    ((stats.focusMinutes / 120) * 25) + // Target 2 hours
    (stats.journalWritten ? 25 : 0)
  ) : 0
  
  if (!mounted) {
    return <div className="p-8">Loading...</div>
  }
  
  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-sm">{today}</p>
            <h1 className="text-3xl font-bold text-zinc-100">{greeting}</h1>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono text-purple-400">{phase.glyph}</span>
              <div>
                <p className="text-sm text-zinc-300">{phase.name} Phase</p>
                <p className="text-xs text-zinc-500">Day {phase.day} of 52</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Day Score */}
      <div className="cascade-card p-6 mb-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 mb-1">Today's Score</p>
            <p className={`text-5xl font-bold ${
              dayScore >= 75 ? 'text-emerald-400' :
              dayScore >= 50 ? 'text-cyan-400' :
              dayScore >= 25 ? 'text-amber-400' :
              'text-zinc-500'
            }`}>{dayScore}%</p>
            <p className="text-xs text-zinc-500 mt-1">
              {dayScore >= 75 ? 'Exceptional day!' :
               dayScore >= 50 ? 'Solid progress' :
               dayScore >= 25 ? 'Keep pushing' :
               'Day is young'}
            </p>
          </div>
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48" cy="48" r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-zinc-800"
              />
              <circle
                cx="48" cy="48" r="40"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - dayScore / 100)}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <TodayWidget
          title="Microorcims"
          icon="⚡"
          value={`${stats.microorcimsFired}/${stats.microorcimsAttempted}`}
          subtitle="fired today"
          color="cyan"
          href="/microorcim"
        />
        <TodayWidget
          title="Focus"
          icon="🎯"
          value={`${stats.focusMinutes}m`}
          subtitle={`${stats.focusSessions} sessions`}
          color="purple"
          href="/focus"
        />
        <TodayWidget
          title="Rituals"
          icon="🔄"
          value={`${stats.ritualsCompleted}/${stats.ritualsTotal}`}
          subtitle="completed"
          color="emerald"
          href="/rituals"
        />
        <TodayWidget
          title="Journal"
          icon="📝"
          value={stats.journalWritten ? '✓' : '—'}
          subtitle={stats.journalWritten ? 'written' : 'not yet'}
          color={stats.journalWritten ? 'emerald' : 'zinc'}
          href="/journal"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/focus">
                <QuickAction icon="🎯" label="Start Focus" onClick={() => {}} color="purple" />
              </Link>
              <Link href="/microorcim">
                <QuickAction icon="⚡" label="Fire Microorcim" onClick={() => {}} color="cyan" />
              </Link>
              <Link href="/journal">
                <QuickAction icon="📝" label="Write Journal" onClick={() => {}} color="amber" />
              </Link>
              <Link href="/oracle">
                <QuickAction icon="🔮" label="Ask Oracle" onClick={() => {}} color="purple" />
              </Link>
            </div>
          </div>
          
          {/* Inbox */}
          {captures.length > 0 && (
            <div className="cascade-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-zinc-200">Inbox</h3>
                <span className="text-sm text-cyan-400">{stats.capturesUnprocessed} unprocessed</span>
              </div>
              <div className="space-y-2">
                {captures.map(capture => (
                  <div 
                    key={capture.id}
                    className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <span className="text-lg">
                      {capture.type === 'thought' ? '💭' :
                       capture.type === 'task' ? '✓' :
                       capture.type === 'idea' ? '💡' :
                       capture.type === 'question' ? '❓' :
                       capture.type === 'gratitude' ? '🙏' : '⚡'}
                    </span>
                    <span className="flex-1 text-sm text-zinc-300 truncate">{capture.content}</span>
                    <button
                      onClick={() => processCapture(capture.id)}
                      className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs hover:bg-emerald-500/30"
                    >
                      Done
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Today's Guidance */}
          <div className="cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-mono text-purple-400">{phase.glyph}</span>
              <h3 className="text-lg font-medium text-zinc-200">{phase.name} Phase Guidance</h3>
            </div>
            <p className="text-zinc-400 text-sm">
              {phase.name === 'Center' && "Return to your invariant. Before action, find stillness. The center holds."}
              {phase.name === 'Flow' && "Move without losing yourself. Let momentum build while staying anchored."}
              {phase.name === 'Insight' && "Perception is power. Look deeper. What are you not seeing?"}
              {phase.name === 'Rise' && "Bold action time. Fire microorcims. Let intent overcome drift."}
              {phase.name === 'Light' && "Share what you've learned. Illuminate others. Your light strengthens theirs."}
              {phase.name === 'Integrity' && "Hold your boundaries. Say no to protect your yes. The container matters."}
              {phase.name === 'Return' && "Complete the cycle. Review what was. Prepare for what comes."}
            </p>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Streak Status */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Momentum</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Journal Streak</span>
                <span className="font-mono text-amber-400">🔥 0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Ritual Streak</span>
                <span className="font-mono text-emerald-400">🔥 0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Focus Streak</span>
                <span className="font-mono text-purple-400">🔥 0</span>
              </div>
            </div>
          </div>
          
          {/* Time Blocks */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Day Structure</h3>
            <div className="space-y-2 text-sm">
              <div className={`p-2 rounded ${new Date().getHours() < 12 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-500'}`}>
                <span className="font-mono">06-12</span> Morning: Deep Work
              </div>
              <div className={`p-2 rounded ${new Date().getHours() >= 12 && new Date().getHours() < 17 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-500'}`}>
                <span className="font-mono">12-17</span> Afternoon: Execution
              </div>
              <div className={`p-2 rounded ${new Date().getHours() >= 17 && new Date().getHours() < 21 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-500'}`}>
                <span className="font-mono">17-21</span> Evening: Review
              </div>
              <div className={`p-2 rounded ${new Date().getHours() >= 21 || new Date().getHours() < 6 ? 'bg-purple-500/20 text-purple-300' : 'bg-zinc-800 text-zinc-500'}`}>
                <span className="font-mono">21-06</span> Night: Rest
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Navigate</h3>
            <div className="space-y-2">
              <Link href="/review" className="block p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-400 transition-colors">
                → Weekly Review
              </Link>
              <Link href="/values" className="block p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-400 transition-colors">
                → Core Values
              </Link>
              <Link href="/goals" className="block p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-400 transition-colors">
                → Goals
              </Link>
              <Link href="/insights" className="block p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-400 transition-colors">
                → Insights
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
