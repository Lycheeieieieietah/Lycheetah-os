'use client'

import { useState, useEffect } from 'react'
import { useCascadeData } from '@/lib/hooks/use-cascade-data'

// ============================================================================
// TYPES
// ============================================================================

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  lamague: string
  category: 'microorcim' | 'streak' | 'milestone' | 'mastery' | 'special'
  requirement: {
    type: string
    value: number
  }
  unlockedAt?: number
}

// ============================================================================
// ACHIEVEMENTS DEFINITIONS
// ============================================================================

const ACHIEVEMENTS: Achievement[] = [
  // Microorcim achievements
  { id: 'first-mu', title: 'First Fire', description: 'Fire your first microorcim', icon: '⚡', lamague: 'Φ↑', category: 'microorcim', requirement: { type: 'microorcims', value: 1 } },
  { id: 'mu-10', title: 'Spark', description: 'Fire 10 microorcims', icon: '✨', lamague: 'Φ↑', category: 'microorcim', requirement: { type: 'microorcims', value: 10 } },
  { id: 'mu-50', title: 'Flame', description: 'Fire 50 microorcims', icon: '🔥', lamague: 'Φ↑', category: 'microorcim', requirement: { type: 'microorcims', value: 50 } },
  { id: 'mu-100', title: 'Blaze', description: 'Fire 100 microorcims', icon: '🌟', lamague: 'Φ↑', category: 'microorcim', requirement: { type: 'microorcims', value: 100 } },
  { id: 'mu-500', title: 'Inferno', description: 'Fire 500 microorcims', icon: '💥', lamague: 'Φ↑', category: 'microorcim', requirement: { type: 'microorcims', value: 500 } },
  { id: 'mu-1000', title: 'Supernova', description: 'Fire 1000 microorcims', icon: '☀️', lamague: 'Φ↑', category: 'microorcim', requirement: { type: 'microorcims', value: 1000 } },
  
  // Streak achievements
  { id: 'streak-3', title: 'Momentum', description: '3-day journal streak', icon: '📝', lamague: '≋', category: 'streak', requirement: { type: 'journalStreak', value: 3 } },
  { id: 'streak-7', title: 'Week Warrior', description: '7-day journal streak', icon: '🏆', lamague: '≋', category: 'streak', requirement: { type: 'journalStreak', value: 7 } },
  { id: 'streak-30', title: 'Monthly Master', description: '30-day journal streak', icon: '👑', lamague: '≋', category: 'streak', requirement: { type: 'journalStreak', value: 30 } },
  { id: 'streak-100', title: 'Centurion', description: '100-day journal streak', icon: '💎', lamague: '≋', category: 'streak', requirement: { type: 'journalStreak', value: 100 } },
  { id: 'streak-365', title: 'Year of Fire', description: '365-day journal streak', icon: '🌈', lamague: '≋', category: 'streak', requirement: { type: 'journalStreak', value: 365 } },
  
  // Focus achievements
  { id: 'focus-1h', title: 'Deep Dive', description: '1 hour of focus time', icon: '🎯', lamague: '⟟', category: 'milestone', requirement: { type: 'focusHours', value: 1 } },
  { id: 'focus-10h', title: 'Flow State', description: '10 hours of focus time', icon: '🌊', lamague: '⟟', category: 'milestone', requirement: { type: 'focusHours', value: 10 } },
  { id: 'focus-100h', title: 'Deep Work Master', description: '100 hours of focus time', icon: '🧘', lamague: '⟟', category: 'milestone', requirement: { type: 'focusHours', value: 100 } },
  
  // Mastery achievements
  { id: 'ritual-master', title: 'Ritual Keeper', description: 'Complete 100 ritual sessions', icon: '🔄', lamague: '⟲', category: 'mastery', requirement: { type: 'ritualsCompleted', value: 100 } },
  { id: 'breath-master', title: 'Breath Master', description: 'Complete 50 breathwork sessions', icon: '💨', lamague: '⟟', category: 'mastery', requirement: { type: 'breathSessions', value: 50 } },
  { id: 'gratitude-master', title: 'Gratitude Sage', description: 'Log 100 days of gratitude', icon: '✧', lamague: '✧', category: 'mastery', requirement: { type: 'gratitudeDays', value: 100 } },
  
  // Special achievements
  { id: 'first-week', title: 'Week One', description: 'Complete your first week with CASCADE', icon: '🌱', lamague: 'Ψ', category: 'special', requirement: { type: 'daysActive', value: 7 } },
  { id: 'first-month', title: 'Month Strong', description: 'One month with CASCADE', icon: '🌿', lamague: 'Ψ', category: 'special', requirement: { type: 'daysActive', value: 30 } },
  { id: 'phase-complete', title: 'Phase Complete', description: 'Complete a full 52-day phase', icon: '🌙', lamague: '⟲', category: 'special', requirement: { type: 'phasesCompleted', value: 1 } },
  { id: 'cycle-complete', title: 'Full Cycle', description: 'Complete a full 364-day cycle', icon: '🌟', lamague: '⟲', category: 'special', requirement: { type: 'cyclesCompleted', value: 1 } },
]

// ============================================================================
// ACHIEVEMENT CARD
// ============================================================================

function AchievementCard({ 
  achievement, 
  progress,
  unlocked 
}: { 
  achievement: Achievement
  progress: number
  unlocked: boolean
}) {
  const categoryColors = {
    microorcim: 'cyan',
    streak: 'amber',
    milestone: 'purple',
    mastery: 'emerald',
    special: 'pink'
  }
  
  const color = categoryColors[achievement.category]
  const progressPercent = Math.min((progress / achievement.requirement.value) * 100, 100)
  
  return (
    <div className={`cascade-card p-4 ${unlocked ? `border-${color}-500/30` : 'opacity-60'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
          unlocked ? `bg-${color}-500/20` : 'bg-zinc-800'
        }`}>
          {unlocked ? achievement.icon : '🔒'}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium ${unlocked ? 'text-zinc-200' : 'text-zinc-500'}`}>
              {achievement.title}
            </h3>
            <span className="font-mono text-purple-400 text-sm">{achievement.lamague}</span>
          </div>
          <p className="text-xs text-zinc-500 mb-2">{achievement.description}</p>
          
          {!unlocked && (
            <div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
                <div 
                  className={`h-full bg-${color}-500 transition-all`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-zinc-600">
                {progress} / {achievement.requirement.value}
              </p>
            </div>
          )}
          
          {unlocked && achievement.unlockedAt && (
            <p className="text-xs text-zinc-600">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AchievementsPage() {
  const { metrics, loading } = useCascadeData()
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  
  // Load unlocked achievements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-achievements')
      if (saved) setUnlockedAchievements(JSON.parse(saved))
    }
  }, [])
  
  // Check for new achievements
  useEffect(() => {
    if (!metrics || loading) return
    
    const newUnlocked = { ...unlockedAchievements }
    let changed = false
    
    // Calculate progress values
    const progressValues: Record<string, number> = {
      microorcims: metrics.allTime.microorcimsFired,
      journalStreak: metrics.streaks.journal,
      focusHours: Math.floor(metrics.allTime.focusMinutes / 60),
      ritualsCompleted: metrics.allTime.ritualsCompleted,
      breathSessions: JSON.parse(localStorage.getItem('cascade-breath-sessions') || '[]').length,
      gratitudeDays: JSON.parse(localStorage.getItem('cascade-gratitude') || '[]').length,
      daysActive: Math.floor((Date.now() - (JSON.parse(localStorage.getItem('cascade-onboarding') || '{}').completedAt || Date.now())) / (1000 * 60 * 60 * 24)),
      phasesCompleted: Math.floor(metrics.phase.dayOfYear / 52),
      cyclesCompleted: Math.floor(metrics.phase.dayOfYear / 364)
    }
    
    ACHIEVEMENTS.forEach(achievement => {
      const progress = progressValues[achievement.requirement.type] || 0
      if (progress >= achievement.requirement.value && !newUnlocked[achievement.id]) {
        newUnlocked[achievement.id] = Date.now()
        changed = true
      }
    })
    
    if (changed) {
      setUnlockedAchievements(newUnlocked)
      localStorage.setItem('cascade-achievements', JSON.stringify(newUnlocked))
    }
  }, [metrics, loading, unlockedAchievements])
  
  const getProgress = (achievement: Achievement): number => {
    if (!metrics) return 0
    
    const progressValues: Record<string, number> = {
      microorcims: metrics.allTime.microorcimsFired,
      journalStreak: metrics.streaks.journal,
      focusHours: Math.floor(metrics.allTime.focusMinutes / 60),
      ritualsCompleted: metrics.allTime.ritualsCompleted,
      breathSessions: 0,
      gratitudeDays: 0,
      daysActive: 0,
      phasesCompleted: Math.floor(metrics.phase.dayOfYear / 52),
      cyclesCompleted: Math.floor(metrics.phase.dayOfYear / 364)
    }
    
    return progressValues[achievement.requirement.type] || 0
  }
  
  // Filter achievements
  const filtered = ACHIEVEMENTS.filter(a => {
    if (filter === 'unlocked') return unlockedAchievements[a.id]
    if (filter === 'locked') return !unlockedAchievements[a.id]
    return true
  })
  
  const unlockedCount = Object.keys(unlockedAchievements).length
  const totalCount = ACHIEVEMENTS.length
  
  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-48" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-zinc-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Achievements</h1>
        <p className="text-zinc-500">Milestones on your sovereignty journey</p>
      </header>
      
      {/* Progress Overview */}
      <div className="cascade-card p-6 mb-8 bg-gradient-to-br from-amber-500/5 to-purple-500/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-4xl font-bold text-amber-400">{unlockedCount}</p>
            <p className="text-sm text-zinc-500">of {totalCount} unlocked</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-400">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </p>
            <p className="text-sm text-zinc-500">complete</p>
          </div>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-purple-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'unlocked', 'locked'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unlocked' && ` (${unlockedCount})`}
          </button>
        ))}
      </div>
      
      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={{ ...achievement, unlockedAt: unlockedAchievements[achievement.id] }}
            progress={getProgress(achievement)}
            unlocked={!!unlockedAchievements[achievement.id]}
          />
        ))}
      </div>
      
      {/* Philosophy */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-amber-500/5 to-pink-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">✧ A Note on Achievements</h3>
        <p className="text-sm text-zinc-400">
          These milestones celebrate consistency, not productivity. They mark your commitment to 
          the practice, not external outcomes. The real achievement is showing up, day after day, 
          protecting your invariant self. These badges are simply witnesses to that journey.
        </p>
      </div>
    </div>
  )
}
