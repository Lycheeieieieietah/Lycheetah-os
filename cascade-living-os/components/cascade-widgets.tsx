'use client'

import { useCascadeData, ActivityItem } from '@/lib/hooks/use-cascade-data'

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

function ActivityItemCard({ item }: { item: ActivityItem }) {
  const typeConfig: Record<string, { icon: string; color: string }> = {
    microorcim: { icon: '⚡', color: 'cyan' },
    focus: { icon: '🎯', color: 'purple' },
    journal: { icon: '📝', color: 'amber' },
    ritual: { icon: '🔄', color: 'emerald' },
    goal: { icon: '🎯', color: 'pink' },
    commitment: { icon: '✓', color: 'blue' },
    capture: { icon: '💭', color: 'zinc' },
    energy: { icon: '⚡', color: 'yellow' },
    memory: { icon: '🧠', color: 'purple' }
  }
  
  const config = typeConfig[item.type] || { icon: '•', color: 'zinc' }
  
  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }
  
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-lg w-8 text-center">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300 truncate">{item.action}</p>
      </div>
      <span className="text-xs text-zinc-600">{timeAgo(item.timestamp)}</span>
    </div>
  )
}

// ============================================================================
// ACTIVITY FEED COMPONENT
// ============================================================================

export function ActivityFeed({ limit = 10 }: { limit?: number }) {
  const { metrics, loading } = useCascadeData()
  
  if (loading || !metrics) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-zinc-800 rounded" />
        ))}
      </div>
    )
  }
  
  const activities = metrics.recentActivity.slice(0, limit)
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <p>No activity yet</p>
        <p className="text-xs mt-1">Start by firing a microorcim or completing a focus session</p>
      </div>
    )
  }
  
  return (
    <div className="divide-y divide-zinc-800">
      {activities.map(item => (
        <ActivityItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}

// ============================================================================
// STREAKS DISPLAY COMPONENT
// ============================================================================

export function StreaksDisplay() {
  const { metrics, loading } = useCascadeData()
  
  if (loading || !metrics) {
    return <div className="animate-pulse h-24 bg-zinc-800 rounded" />
  }
  
  const streaks = [
    { name: 'Journal', value: metrics.streaks.journal, icon: '📝' },
    { name: 'Rituals', value: metrics.streaks.rituals, icon: '🔄' },
    { name: 'Focus', value: metrics.streaks.focus, icon: '🎯' },
    { name: 'μ', value: metrics.streaks.microorcim, icon: '⚡' },
    { name: 'Energy', value: metrics.streaks.energy, icon: '🔋' }
  ]
  
  const maxStreak = Math.max(...streaks.map(s => s.value), 1)
  
  return (
    <div className="space-y-2">
      {streaks.map(streak => (
        <div key={streak.name} className="flex items-center gap-3">
          <span className="w-6 text-center">{streak.icon}</span>
          <span className="w-16 text-sm text-zinc-400">{streak.name}</span>
          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                streak.value > 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-zinc-700'
              }`}
              style={{ width: `${(streak.value / maxStreak) * 100}%` }}
            />
          </div>
          <span className={`w-8 text-right font-mono text-sm ${streak.value > 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
            {streak.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// SOVEREIGNTY GAUGE COMPONENT
// ============================================================================

export function SovereigntyGauge() {
  const { metrics, loading } = useCascadeData()
  
  if (loading || !metrics) {
    return <div className="animate-pulse h-32 bg-zinc-800 rounded" />
  }
  
  const { score, drift, coherence, alignment } = metrics.sovereignty
  
  return (
    <div className="text-center">
      {/* Main gauge */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64" cy="64" r="56"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-zinc-800"
          />
          <circle
            cx="64" cy="64" r="56"
            stroke="url(#sovereigntyGradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 56}
            strokeDashoffset={2 * Math.PI * 56 * (1 - score / 100)}
          />
          <defs>
            <linearGradient id="sovereigntyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div>
            <p className="text-3xl font-bold text-zinc-100">{score}%</p>
            <p className="text-xs text-zinc-500">Sovereignty</p>
          </div>
        </div>
      </div>
      
      {/* Sub-metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 bg-zinc-800/50 rounded">
          <p className={`font-bold ${drift < 30 ? 'text-emerald-400' : drift < 60 ? 'text-amber-400' : 'text-red-400'}`}>
            {drift}%
          </p>
          <p className="text-zinc-500">Drift</p>
        </div>
        <div className="p-2 bg-zinc-800/50 rounded">
          <p className="font-bold text-purple-400">{coherence}%</p>
          <p className="text-zinc-500">Coherence</p>
        </div>
        <div className="p-2 bg-zinc-800/50 rounded">
          <p className="font-bold text-cyan-400">{alignment}%</p>
          <p className="text-zinc-500">Alignment</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PHASE INDICATOR COMPONENT
// ============================================================================

export function PhaseIndicator({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { metrics, loading } = useCascadeData()
  
  if (loading || !metrics) {
    return <div className="animate-pulse h-16 bg-zinc-800 rounded" />
  }
  
  const { name, glyph, dayInPhase, progress } = metrics.phase
  
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  }
  
  return (
    <div className="flex items-center gap-4">
      <span className={`font-mono text-purple-400 ${sizeClasses[size]}`}>{glyph}</span>
      <div className="flex-1">
        <p className="font-medium text-zinc-200">{name} Phase</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500">Day {dayInPhase}/52</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TODAY STATS COMPONENT
// ============================================================================

export function TodayStats() {
  const { metrics, loading } = useCascadeData()
  
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-20 bg-zinc-800 rounded" />
        ))}
      </div>
    )
  }
  
  const stats = [
    { 
      label: 'Microorcims', 
      value: `${metrics.today.microorcimsFired}/${metrics.today.microorcimsAttempted}`,
      icon: '⚡',
      color: 'cyan'
    },
    { 
      label: 'Focus', 
      value: `${metrics.today.focusMinutes}m`,
      icon: '🎯',
      color: 'purple'
    },
    { 
      label: 'Rituals', 
      value: `${metrics.today.ritualsCompleted}/${metrics.today.ritualsTotal}`,
      icon: '🔄',
      color: 'emerald'
    },
    { 
      label: 'Journal', 
      value: metrics.today.journalWritten ? '✓' : '—',
      icon: '📝',
      color: metrics.today.journalWritten ? 'emerald' : 'zinc'
    }
  ]
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map(stat => (
        <div key={stat.label} className="cascade-card p-3 text-center">
          <span className="text-lg">{stat.icon}</span>
          <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
          <p className="text-xs text-zinc-500">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
