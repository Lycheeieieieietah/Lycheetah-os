'use client'

import { useState, useEffect } from 'react'
import { useCascadeData } from '@/lib/hooks/use-cascade-data'

// ============================================================================
// TYPES
// ============================================================================

interface Pattern {
  id: string
  type: 'correlation' | 'trend' | 'cycle' | 'anomaly'
  title: string
  description: string
  confidence: number // 0-1
  insight: string
  lamague: string
  data?: Record<string, any>
}

interface TimeBlock {
  hour: number
  microorcims: number
  focusMinutes: number
  energy: number
}

// ============================================================================
// PATTERN CARD
// ============================================================================

function PatternCard({ pattern }: { pattern: Pattern }) {
  const typeColors = {
    correlation: 'cyan',
    trend: 'purple',
    cycle: 'amber',
    anomaly: 'pink'
  }
  
  const color = typeColors[pattern.type]
  
  return (
    <div className={`cascade-card p-5 border-${color}-500/20 hover:border-${color}-500/40 transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 bg-${color}-500/20 text-${color}-400 text-xs rounded`}>
            {pattern.type}
          </span>
          <span className="font-mono text-purple-400">{pattern.lamague}</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-zinc-300">{Math.round(pattern.confidence * 100)}%</p>
          <p className="text-xs text-zinc-600">confidence</p>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-zinc-200 mb-2">{pattern.title}</h3>
      <p className="text-sm text-zinc-400 mb-3">{pattern.description}</p>
      
      <div className={`p-3 bg-${color}-500/5 border border-${color}-500/20 rounded-lg`}>
        <p className="text-xs text-zinc-500 mb-1">Insight</p>
        <p className="text-sm text-zinc-300">{pattern.insight}</p>
      </div>
    </div>
  )
}

// ============================================================================
// TIME HEATMAP
// ============================================================================

function TimeHeatmap({ blocks }: { blocks: TimeBlock[] }) {
  const maxMicroorcims = Math.max(...blocks.map(b => b.microorcims), 1)
  const maxFocus = Math.max(...blocks.map(b => b.focusMinutes), 1)
  
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">Activity by Hour</h3>
      
      <div className="grid grid-cols-24 gap-0.5 mb-4">
        {blocks.map((block, i) => (
          <div key={i} className="text-center">
            <div 
              className="h-16 rounded-sm transition-all"
              style={{
                background: `linear-gradient(to top, 
                  rgba(6, 182, 212, ${block.microorcims / maxMicroorcims * 0.8}) 0%, 
                  rgba(168, 85, 247, ${block.focusMinutes / maxFocus * 0.8}) 100%)`
              }}
              title={`${block.hour}:00 - μ: ${block.microorcims}, Focus: ${block.focusMinutes}m`}
            />
            {i % 4 === 0 && (
              <span className="text-xs text-zinc-600">{block.hour}</span>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded" />
          <span className="text-zinc-400">Microorcims</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded" />
          <span className="text-zinc-400">Focus</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CORRELATION MATRIX
// ============================================================================

function CorrelationMatrix({ correlations }: { correlations: { a: string; b: string; r: number }[] }) {
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">Correlations</h3>
      
      <div className="space-y-2">
        {correlations.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 text-sm text-zinc-400 truncate">{c.a}</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  c.r > 0 ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.abs(c.r) * 100}%`,
                  marginLeft: c.r < 0 ? `${(1 - Math.abs(c.r)) * 100}%` : 0
                }}
              />
            </div>
            <span className="w-24 text-sm text-zinc-400 truncate text-right">{c.b}</span>
            <span className={`w-12 text-sm font-mono ${c.r > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {c.r > 0 ? '+' : ''}{c.r.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function PatternsPage() {
  const { metrics, loading } = useCascadeData()
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [correlations, setCorrelations] = useState<{ a: string; b: string; r: number }[]>([])
  
  // Analyze patterns when data loads
  useEffect(() => {
    if (!metrics || loading) return
    
    // Generate time blocks (mock for now, would analyze actual timestamps)
    const blocks: TimeBlock[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      microorcims: hour >= 8 && hour <= 18 ? Math.floor(Math.random() * 5) : 0,
      focusMinutes: hour >= 9 && hour <= 17 ? Math.floor(Math.random() * 60) : 0,
      energy: hour >= 6 && hour <= 22 ? 2 + Math.random() * 3 : 1
    }))
    setTimeBlocks(blocks)
    
    // Generate correlations (mock - would calculate from actual data)
    const corrs = [
      { a: 'Morning μ', b: 'Day Score', r: 0.72 },
      { a: 'Sleep', b: 'Focus Duration', r: 0.65 },
      { a: 'Energy', b: 'μ Fired', r: 0.58 },
      { a: 'Rituals', b: 'Mood', r: 0.45 },
      { a: 'Skipped Ritual', b: 'Drift', r: -0.52 }
    ]
    setCorrelations(corrs)
    
    // Generate patterns based on metrics
    const detectedPatterns: Pattern[] = []
    
    // Streak patterns
    if (metrics.streaks.journal >= 3) {
      detectedPatterns.push({
        id: 'streak-journal',
        type: 'trend',
        title: 'Journal Momentum',
        description: `You've journaled ${metrics.streaks.journal} days in a row.`,
        confidence: 0.95,
        insight: 'Consistent journaling correlates with higher sovereignty scores. Keep the streak alive.',
        lamague: 'Ψ'
      })
    }
    
    // Sovereignty patterns
    if (metrics.sovereignty.drift > 40) {
      detectedPatterns.push({
        id: 'drift-warning',
        type: 'anomaly',
        title: 'Elevated Drift Detected',
        description: `Your drift score is ${metrics.sovereignty.drift}%, above the healthy threshold.`,
        confidence: 0.8,
        insight: 'High drift often precedes sovereignty loss. Consider returning to center (⟟) rituals.',
        lamague: '⟟'
      })
    }
    
    // Phase patterns
    if (metrics.phase.dayInPhase <= 7) {
      detectedPatterns.push({
        id: 'phase-start',
        type: 'cycle',
        title: 'New Phase Beginning',
        description: `Day ${metrics.phase.dayInPhase} of ${metrics.phase.name} phase.`,
        confidence: 0.9,
        insight: `Early in ${metrics.phase.name}. This is the time to set intentions for the 52-day cycle.`,
        lamague: metrics.phase.glyph
      })
    }
    
    // Focus patterns
    if (metrics.today.focusMinutes > 120) {
      detectedPatterns.push({
        id: 'deep-work',
        type: 'trend',
        title: 'Deep Work Day',
        description: `${metrics.today.focusMinutes} minutes of focused work today.`,
        confidence: 0.85,
        insight: 'Above-average focus. Consider logging what enabled this for future reference.',
        lamague: '≋'
      })
    }
    
    // Commitment patterns
    if (metrics.allTime.commitmentsKept > 0) {
      const keepRate = metrics.allTime.commitmentsKept / 
        (metrics.allTime.commitmentsKept + metrics.allTime.commitmentsBroken)
      if (keepRate > 0.8) {
        detectedPatterns.push({
          id: 'high-integrity',
          type: 'correlation',
          title: 'High Integrity Score',
          description: `${Math.round(keepRate * 100)}% of commitments kept.`,
          confidence: 0.9,
          insight: 'Strong commitment keeping builds trust with self and others. This is sovereignty in action.',
          lamague: '∥◁▷∥'
        })
      }
    }
    
    // Energy-mood correlation
    if (metrics.today.energyAvg > 0 && metrics.today.moodAvg > 0) {
      detectedPatterns.push({
        id: 'energy-mood',
        type: 'correlation',
        title: 'Energy-Mood Link',
        description: `Energy: ${metrics.today.energyAvg}/5, Mood: ${metrics.today.moodAvg}/5`,
        confidence: 0.75,
        insight: 'Your energy and mood are tracked together. Watch for patterns in what affects each.',
        lamague: 'Φ↑'
      })
    }
    
    setPatterns(detectedPatterns)
  }, [metrics, loading])
  
  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-48" />
          <div className="h-64 bg-zinc-800 rounded" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Pattern Recognition</h1>
        <p className="text-zinc-500">AI-detected patterns across your CASCADE data</p>
      </header>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{patterns.length}</p>
          <p className="text-xs text-zinc-500">Patterns Detected</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{correlations.length}</p>
          <p className="text-xs text-zinc-500">Correlations</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">
            {patterns.filter(p => p.type === 'trend').length}
          </p>
          <p className="text-xs text-zinc-500">Active Trends</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-pink-400">
            {patterns.filter(p => p.type === 'anomaly').length}
          </p>
          <p className="text-xs text-zinc-500">Anomalies</p>
        </div>
      </div>
      
      {/* Time Heatmap */}
      <div className="mb-8">
        <TimeHeatmap blocks={timeBlocks} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Correlations */}
        <CorrelationMatrix correlations={correlations} />
        
        {/* Phase Analysis */}
        <div className="cascade-card p-6">
          <h3 className="text-lg font-medium text-zinc-200 mb-4">Phase Analysis</h3>
          {metrics && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-mono text-purple-400">{metrics.phase.glyph}</span>
                <div>
                  <p className="font-medium text-zinc-200">{metrics.phase.name} Phase</p>
                  <p className="text-sm text-zinc-500">Day {metrics.phase.dayInPhase} of 52</p>
                </div>
              </div>
              
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  style={{ width: `${metrics.phase.progress * 100}%` }}
                />
              </div>
              
              <p className="text-sm text-zinc-400">
                {metrics.phase.name === 'Center' && 'Focus on grounding and returning to core values.'}
                {metrics.phase.name === 'Flow' && 'Allow natural momentum while staying anchored.'}
                {metrics.phase.name === 'Insight' && 'Heightened perception. Pay attention to what emerges.'}
                {metrics.phase.name === 'Rise' && 'Time for bold action and firing microorcims.'}
                {metrics.phase.name === 'Light' && 'Share what you\'ve learned. Illuminate others.'}
                {metrics.phase.name === 'Integrity' && 'Hold boundaries. Complete commitments.'}
                {metrics.phase.name === 'Return' && 'Complete the cycle. Review and integrate.'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Detected Patterns */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-zinc-200 mb-4">Detected Patterns</h2>
        {patterns.length === 0 ? (
          <div className="cascade-card p-8 text-center">
            <p className="text-zinc-500">Not enough data yet to detect patterns.</p>
            <p className="text-xs text-zinc-600 mt-1">Keep using CASCADE and patterns will emerge.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map(pattern => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        )}
      </div>
      
      {/* Philosophy */}
      <div className="cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">Ψ Pattern Recognition</h3>
        <p className="text-sm text-zinc-400">
          Patterns are the language of the unconscious made visible. By tracking enough data points,
          CASCADE reveals correlations you might not consciously notice. High energy mornings → 
          more microorcims. Skipped rituals → elevated drift. These patterns, once seen, 
          can be leveraged for sovereignty.
        </p>
      </div>
    </div>
  )
}
