'use client'

import { useState, useEffect, useCallback } from 'react'

// ============================================================================
// TYPES - Unified data from all CASCADE systems
// ============================================================================

export interface CascadeMetrics {
  // Today
  today: {
    microorcimsFired: number
    microorcimsAttempted: number
    focusMinutes: number
    focusSessions: number
    ritualsCompleted: number
    ritualsTotal: number
    journalWritten: boolean
    energyAvg: number
    moodAvg: number
    capturesUnprocessed: number
    commitmentsActive: number
    goalsProgressed: number
  }
  
  // Streaks
  streaks: {
    journal: number
    rituals: number
    focus: number
    microorcim: number
    energy: number
  }
  
  // All-time
  allTime: {
    totalMicroorcims: number
    totalFocusHours: number
    totalJournalEntries: number
    totalRitualCompletions: number
    goalsCompleted: number
    commitmentsKept: number
    commitmentsBroken: number
    valuesCount: number
    memoriesCount: number
  }
  
  // Phase
  phase: {
    index: number
    name: string
    glyph: string
    dayInPhase: number
    dayOfYear: number
    progress: number
  }
  
  // Sovereignty
  sovereignty: {
    score: number
    drift: number
    coherence: number
    alignment: number
  }
  
  // Recent activity
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'microorcim' | 'focus' | 'journal' | 'ritual' | 'goal' | 'commitment' | 'capture' | 'energy' | 'memory'
  action: string
  timestamp: number
  metadata?: Record<string, any>
}

// ============================================================================
// PHASE CALCULATION
// ============================================================================

function calculatePhase() {
  const cycleStart = new Date('2025-01-01')
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) % 364
  const phaseIndex = Math.floor(dayOfYear / 52)
  const dayInPhase = (dayOfYear % 52) + 1
  
  const phases = [
    { name: 'Center', glyph: '⟟' },
    { name: 'Flow', glyph: '≋' },
    { name: 'Insight', glyph: 'Ψ' },
    { name: 'Rise', glyph: 'Φ↑' },
    { name: 'Light', glyph: '✧' },
    { name: 'Integrity', glyph: '∥◁▷∥' },
    { name: 'Return', glyph: '⟲' }
  ]
  
  return {
    index: phaseIndex,
    name: phases[phaseIndex].name,
    glyph: phases[phaseIndex].glyph,
    dayInPhase,
    dayOfYear: dayOfYear + 1,
    progress: dayInPhase / 52
  }
}

// ============================================================================
// STREAK CALCULATION
// ============================================================================

function calculateStreak(items: { timestamp: number }[], dailyTarget = 1): number {
  if (items.length === 0) return 0
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let checkDate = new Date(today)
  
  // Check if today has entries
  const todayStr = today.toDateString()
  const todayItems = items.filter(i => new Date(i.timestamp).toDateString() === todayStr)
  
  // If no entries today, start checking from yesterday
  if (todayItems.length < dailyTarget) {
    checkDate.setDate(checkDate.getDate() - 1)
  }
  
  // Count consecutive days
  while (true) {
    const dateStr = checkDate.toDateString()
    const dayItems = items.filter(i => new Date(i.timestamp).toDateString() === dateStr)
    
    if (dayItems.length >= dailyTarget) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
    
    // Safety limit
    if (streak > 365) break
  }
  
  return streak
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useCascadeData(): {
  metrics: CascadeMetrics | null
  loading: boolean
  refresh: () => void
} {
  const [metrics, setMetrics] = useState<CascadeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  
  const loadData = useCallback(() => {
    if (typeof window === 'undefined') return
    
    setLoading(true)
    const todayStr = new Date().toDateString()
    
    try {
      // Load all data sources
      const microorcims = JSON.parse(localStorage.getItem('cascade-microorcims') || '[]')
      const focusSessions = JSON.parse(localStorage.getItem('cascade-focus-sessions') || '[]')
      const journal = JSON.parse(localStorage.getItem('cascade-journal') || '[]')
      const rituals = JSON.parse(localStorage.getItem('cascade-rituals') || '[]')
      const goals = JSON.parse(localStorage.getItem('cascade-goals') || '[]')
      const commitments = JSON.parse(localStorage.getItem('cascade-commitments') || '[]')
      const values = JSON.parse(localStorage.getItem('cascade-values') || '[]')
      const captures = JSON.parse(localStorage.getItem('cascade-quick-captures') || '[]')
      const energyLogs = JSON.parse(localStorage.getItem('cascade-energy-logs') || '[]')
      const memories = JSON.parse(localStorage.getItem('cascade-memories') || '[]')
      
      // Today's data
      const todayMicroorcims = microorcims.filter((m: any) => 
        new Date(m.timestamp).toDateString() === todayStr
      )
      const todayFocus = focusSessions.filter((s: any) => 
        new Date(s.startTime).toDateString() === todayStr
      )
      const todayEnergy = energyLogs.filter((e: any) => 
        new Date(e.timestamp).toDateString() === todayStr
      )
      const todayJournal = journal.some((j: any) => 
        new Date(j.timestamp).toDateString() === todayStr
      )
      
      // Rituals today
      const activeRituals = rituals.filter((r: any) => r.active && r.frequency === 'daily')
      const completedRituals = activeRituals.filter((r: any) => {
        const completions = (r.completions || []).filter((c: any) => 
          new Date(c.timestamp).toDateString() === todayStr
        )
        return completions.length >= (r.targetCount || 1)
      })
      
      // Focus minutes
      const focusMins = todayFocus.reduce((sum: number, s: any) => {
        if (s.endTime) {
          return sum + (s.endTime - s.startTime) / 1000 / 60
        }
        return sum
      }, 0)
      
      // Energy averages
      const energyAvg = todayEnergy.length > 0
        ? todayEnergy.reduce((s: number, e: any) => s + e.energy, 0) / todayEnergy.length
        : 0
      const moodAvg = todayEnergy.length > 0
        ? todayEnergy.reduce((s: number, e: any) => s + e.mood, 0) / todayEnergy.length
        : 0
      
      // Streaks
      const journalStreak = calculateStreak(journal.map((j: any) => ({ timestamp: j.timestamp })))
      const focusStreak = calculateStreak(
        focusSessions.filter((s: any) => s.completed).map((s: any) => ({ timestamp: s.startTime }))
      )
      const microorcimStreak = calculateStreak(
        microorcims.filter((m: any) => m.fired).map((m: any) => ({ timestamp: m.timestamp }))
      )
      const energyStreak = calculateStreak(energyLogs.map((e: any) => ({ timestamp: e.timestamp })))
      
      // Ritual streak (all daily rituals completed)
      let ritualStreak = 0
      const checkDate = new Date()
      checkDate.setHours(0, 0, 0, 0)
      while (ritualStreak < 365) {
        const dateStr = checkDate.toDateString()
        const allCompleted = activeRituals.every((r: any) => {
          const dayCompletions = (r.completions || []).filter((c: any) => 
            new Date(c.timestamp).toDateString() === dateStr
          )
          return dayCompletions.length >= (r.targetCount || 1)
        })
        if (allCompleted && activeRituals.length > 0) {
          ritualStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
      
      // All-time stats
      const totalFocusHours = focusSessions.reduce((sum: number, s: any) => {
        if (s.endTime) {
          return sum + (s.endTime - s.startTime) / 1000 / 60 / 60
        }
        return sum
      }, 0)
      
      const totalRitualCompletions = rituals.reduce((sum: number, r: any) => 
        sum + (r.completions?.length || 0), 0
      )
      
      // Sovereignty calculation
      const drift = 0.3 // Would be calculated from patterns
      const coherence = values.length > 0
        ? values.reduce((s: number, v: any) => s + (v.strengthScore || 0.5), 0) / values.length
        : 0.5
      const alignment = completedRituals.length / Math.max(activeRituals.length, 1)
      const sovereigntyScore = ((1 - drift) * coherence * alignment * 100)
      
      // Recent activity (last 20 items)
      const activity: ActivityItem[] = []
      
      microorcims.slice(-5).forEach((m: any) => {
        activity.push({
          id: m.id || `micro-${m.timestamp}`,
          type: 'microorcim',
          action: m.fired ? 'Fired μ' : 'Attempted μ',
          timestamp: m.timestamp,
          metadata: { fired: m.fired }
        })
      })
      
      focusSessions.slice(-5).forEach((s: any) => {
        activity.push({
          id: s.id || `focus-${s.startTime}`,
          type: 'focus',
          action: s.completed ? 'Completed focus session' : 'Started focus',
          timestamp: s.startTime,
          metadata: { duration: s.endTime ? (s.endTime - s.startTime) / 1000 / 60 : 0 }
        })
      })
      
      journal.slice(-5).forEach((j: any) => {
        activity.push({
          id: j.id || `journal-${j.timestamp}`,
          type: 'journal',
          action: 'Journal entry',
          timestamp: j.timestamp
        })
      })
      
      // Sort by timestamp descending
      activity.sort((a, b) => b.timestamp - a.timestamp)
      
      // Build metrics object
      const newMetrics: CascadeMetrics = {
        today: {
          microorcimsFired: todayMicroorcims.filter((m: any) => m.fired).length,
          microorcimsAttempted: todayMicroorcims.length,
          focusMinutes: Math.round(focusMins),
          focusSessions: todayFocus.filter((s: any) => s.completed).length,
          ritualsCompleted: completedRituals.length,
          ritualsTotal: activeRituals.length,
          journalWritten: todayJournal,
          energyAvg: Math.round(energyAvg * 10) / 10,
          moodAvg: Math.round(moodAvg * 10) / 10,
          capturesUnprocessed: captures.filter((c: any) => !c.processed).length,
          commitmentsActive: commitments.filter((c: any) => c.status === 'active').length,
          goalsProgressed: goals.filter((g: any) => g.status === 'active').length
        },
        streaks: {
          journal: journalStreak,
          rituals: ritualStreak,
          focus: focusStreak,
          microorcim: microorcimStreak,
          energy: energyStreak
        },
        allTime: {
          totalMicroorcims: microorcims.filter((m: any) => m.fired).length,
          totalFocusHours: Math.round(totalFocusHours * 10) / 10,
          totalJournalEntries: journal.length,
          totalRitualCompletions,
          goalsCompleted: goals.filter((g: any) => g.status === 'completed').length,
          commitmentsKept: commitments.filter((c: any) => c.status === 'kept').length,
          commitmentsBroken: commitments.filter((c: any) => c.status === 'broken').length,
          valuesCount: values.length,
          memoriesCount: memories.length
        },
        phase: calculatePhase(),
        sovereignty: {
          score: Math.round(sovereigntyScore),
          drift: Math.round(drift * 100),
          coherence: Math.round(coherence * 100),
          alignment: Math.round(alignment * 100)
        },
        recentActivity: activity.slice(0, 20)
      }
      
      setMetrics(newMetrics)
    } catch (error) {
      console.error('Error loading CASCADE data:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  // Load on mount
  useEffect(() => {
    loadData()
  }, [loadData])
  
  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])
  
  return {
    metrics,
    loading,
    refresh: loadData
  }
}

// ============================================================================
// EXPORT DATA FUNCTION
// ============================================================================

export function exportCascadeData(): string {
  if (typeof window === 'undefined') return '{}'
  
  const keys = [
    'cascade-microorcims',
    'cascade-focus-sessions',
    'cascade-journal',
    'cascade-rituals',
    'cascade-goals',
    'cascade-commitments',
    'cascade-values',
    'cascade-quick-captures',
    'cascade-energy-logs',
    'cascade-memories',
    'cascade-weekly-reviews',
    'cascade-value-reflections',
    'cascade-llm-config'
  ]
  
  const data: Record<string, any> = {
    exportedAt: new Date().toISOString(),
    version: '2.0-ultra'
  }
  
  keys.forEach(key => {
    const value = localStorage.getItem(key)
    if (value) {
      try {
        data[key] = JSON.parse(value)
      } catch {
        data[key] = value
      }
    }
  })
  
  return JSON.stringify(data, null, 2)
}

// ============================================================================
// IMPORT DATA FUNCTION
// ============================================================================

export function importCascadeData(jsonString: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const data = JSON.parse(jsonString)
    
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith('cascade-')) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    })
    
    return true
  } catch (error) {
    console.error('Import error:', error)
    return false
  }
}
