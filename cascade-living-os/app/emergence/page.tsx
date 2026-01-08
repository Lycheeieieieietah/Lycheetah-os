'use client'

import { useState, useEffect, useMemo } from 'react'
import { calculateCoherenceField, validateAURA, AURA_PRESETS } from '@/lib/aura/protocol'

// ============================================================================
// TYPES
// ============================================================================

interface FieldState {
  coherence: number
  momentum: number
  alignment: number
  entropy: number
  timestamp: number
}

interface EmergentPattern {
  id: string
  type: 'correlation' | 'cycle' | 'threshold' | 'synchronicity'
  description: string
  confidence: number
  dataPoints: string[]
  discoveredAt: number
  significance: number
}

interface DataStream {
  source: string
  count: number
  lastUpdated: number
  trend: 'up' | 'down' | 'stable'
}

// ============================================================================
// FIELD VISUALIZATION
// ============================================================================

function FieldVisualization({ fieldState }: { fieldState: FieldState }) {
  const [pulsePhase, setPulsePhase] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])
  
  const pulseSize = 150 + Math.sin(pulsePhase * Math.PI / 180) * 20 * fieldState.coherence
  const entropy = 1 - fieldState.entropy
  
  return (
    <div className="relative h-80 flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 20}
              x2="100%"
              y2={i * 20}
              stroke="currentColor"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 20}
              y1="0"
              x2={i * 20}
              y2="100%"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>
      
      {/* Outer rings */}
      {[1, 0.75, 0.5, 0.25].map((scale, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-cyan-500/20"
          style={{
            width: pulseSize * 2 * scale,
            height: pulseSize * 2 * scale,
            opacity: 0.1 + (1 - scale) * 0.2
          }}
        />
      ))}
      
      {/* Main field */}
      <div
        className="relative rounded-full transition-all duration-300"
        style={{
          width: pulseSize,
          height: pulseSize,
          background: `radial-gradient(circle, 
            rgba(6, 182, 212, ${0.3 * fieldState.coherence}) 0%, 
            rgba(168, 85, 247, ${0.2 * fieldState.alignment}) 50%,
            rgba(16, 185, 129, ${0.1 * entropy}) 100%
          )`,
          boxShadow: `
            0 0 ${30 * fieldState.coherence}px rgba(6, 182, 212, ${0.3 * fieldState.coherence}),
            0 0 ${60 * fieldState.coherence}px rgba(168, 85, 247, ${0.2 * fieldState.alignment})
          `
        }}
      >
        {/* Center core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="rounded-full bg-white/10"
            style={{
              width: 20 + fieldState.momentum * 30,
              height: 20 + fieldState.momentum * 30
            }}
          />
        </div>
        
        {/* Orbiting particles */}
        {Array.from({ length: Math.ceil(fieldState.coherence * 8) }).map((_, i) => {
          const angle = (pulsePhase + i * (360 / 8)) * Math.PI / 180
          const radius = 40 + i * 5
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          return (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-cyan-400"
              style={{
                left: `calc(50% + ${x}px - 4px)`,
                top: `calc(50% + ${y}px - 4px)`,
                opacity: 0.5 + fieldState.coherence * 0.5
              }}
            />
          )
        })}
      </div>
      
      {/* Field metrics overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-zinc-500">
        <span>Coherence: {(fieldState.coherence * 100).toFixed(0)}%</span>
        <span>Momentum: {(fieldState.momentum * 100).toFixed(0)}%</span>
        <span>Alignment: {(fieldState.alignment * 100).toFixed(0)}%</span>
        <span>Entropy: {(fieldState.entropy * 100).toFixed(0)}%</span>
      </div>
    </div>
  )
}

// ============================================================================
// PATTERN CARD
// ============================================================================

function PatternCard({ pattern }: { pattern: EmergentPattern }) {
  const typeInfo = {
    correlation: { icon: '🔗', color: 'cyan' },
    cycle: { icon: '🔄', color: 'purple' },
    threshold: { icon: '📊', color: 'amber' },
    synchronicity: { icon: '✧', color: 'pink' }
  }
  
  const info = typeInfo[pattern.type]
  
  return (
    <div className={`p-4 bg-${info.color}-500/5 border border-${info.color}-500/10 rounded-lg`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-lg">{info.icon}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Confidence</span>
          <span className={`text-sm font-mono text-${info.color}-400`}>
            {(pattern.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <p className="text-sm text-zinc-300 mb-2">{pattern.description}</p>
      <div className="flex flex-wrap gap-1">
        {pattern.dataPoints.map((dp, i) => (
          <span key={i} className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-500">
            {dp}
          </span>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// DATA STREAM CARD
// ============================================================================

function DataStreamCard({ stream }: { stream: DataStream }) {
  const trendIcon = stream.trend === 'up' ? '↑' : stream.trend === 'down' ? '↓' : '→'
  const trendColor = stream.trend === 'up' ? 'emerald' : stream.trend === 'down' ? 'red' : 'zinc'
  
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
      <div>
        <p className="text-sm text-zinc-300">{stream.source}</p>
        <p className="text-xs text-zinc-500">
          {new Date(stream.lastUpdated).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-cyan-400">{stream.count}</span>
        <span className={`text-${trendColor}-400`}>{trendIcon}</span>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function EmergencePage() {
  const [fieldState, setFieldState] = useState<FieldState>({
    coherence: 0.6,
    momentum: 0.5,
    alignment: 0.7,
    entropy: 0.3,
    timestamp: Date.now()
  })
  
  const [patterns, setPatterns] = useState<EmergentPattern[]>([])
  const [dataStreams, setDataStreams] = useState<DataStream[]>([])
  
  // Aggregate data from all sources
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const streams: DataStream[] = []
    
    // Check each data source
    const sources = [
      { key: 'cascade-journal', name: 'Journal Entries' },
      { key: 'cascade-microorcim', name: 'Microorcim Events' },
      { key: 'cascade-dreams', name: 'Dreams' },
      { key: 'cascade-shadows', name: 'Shadow Aspects' },
      { key: 'cascade-synchronicities', name: 'Synchronicities' },
      { key: 'cascade-life-scripts', name: 'Life Scripts' },
      { key: 'cascade-temporal-anchors', name: 'Temporal Anchors' },
      { key: 'cascade-gratitude', name: 'Gratitude Entries' },
      { key: 'cascade-goals', name: 'Goals' },
      { key: 'cascade-decisions', name: 'Decisions' },
      { key: 'cascade-focus', name: 'Focus Sessions' },
      { key: 'cascade-rituals', name: 'Rituals' }
    ]
    
    sources.forEach(source => {
      const data = localStorage.getItem(source.key)
      if (data) {
        const parsed = JSON.parse(data)
        const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length
        const lastItem = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null
        
        streams.push({
          source: source.name,
          count,
          lastUpdated: lastItem?.timestamp || lastItem?.createdAt || Date.now(),
          trend: 'stable'
        })
      }
    })
    
    setDataStreams(streams.sort((a, b) => b.count - a.count))
    
    // Calculate field state from data
    const totalEntries = streams.reduce((sum, s) => sum + s.count, 0)
    const activeSources = streams.filter(s => s.count > 0).length
    
    setFieldState({
      coherence: Math.min(1, activeSources / 8),
      momentum: Math.min(1, totalEntries / 100),
      alignment: 0.7, // Would calculate from actual alignment data
      entropy: Math.max(0.1, 1 - (activeSources / sources.length)),
      timestamp: Date.now()
    })
    
    // Generate patterns from data
    generatePatterns(streams)
  }, [])
  
  const generatePatterns = (streams: DataStream[]) => {
    const newPatterns: EmergentPattern[] = []
    
    // Pattern: High activity correlation
    const highActivity = streams.filter(s => s.count >= 5)
    if (highActivity.length >= 3) {
      newPatterns.push({
        id: 'pattern-activity',
        type: 'correlation',
        description: `Strong engagement across ${highActivity.length} data streams indicates integrated practice`,
        confidence: Math.min(1, highActivity.length / 6),
        dataPoints: highActivity.map(s => s.source),
        discoveredAt: Date.now(),
        significance: 7
      })
    }
    
    // Pattern: Journal-Dream connection
    const hasJournal = streams.find(s => s.source === 'Journal Entries')?.count || 0
    const hasDreams = streams.find(s => s.source === 'Dreams')?.count || 0
    if (hasJournal >= 3 && hasDreams >= 2) {
      newPatterns.push({
        id: 'pattern-journal-dream',
        type: 'cycle',
        description: 'Conscious-unconscious bridge forming through regular journaling and dream tracking',
        confidence: 0.75,
        dataPoints: ['Journal Entries', 'Dreams'],
        discoveredAt: Date.now(),
        significance: 8
      })
    }
    
    // Pattern: Shadow-Script connection
    const hasShadows = streams.find(s => s.source === 'Shadow Aspects')?.count || 0
    const hasScripts = streams.find(s => s.source === 'Life Scripts')?.count || 0
    if (hasShadows >= 2 && hasScripts >= 2) {
      newPatterns.push({
        id: 'pattern-shadow-script',
        type: 'correlation',
        description: 'Deep psychological work connecting shadow aspects to life scripts',
        confidence: 0.8,
        dataPoints: ['Shadow Aspects', 'Life Scripts'],
        discoveredAt: Date.now(),
        significance: 9
      })
    }
    
    // Pattern: Synchronicity threshold
    const syncCount = streams.find(s => s.source === 'Synchronicities')?.count || 0
    if (syncCount >= 5) {
      newPatterns.push({
        id: 'pattern-sync-threshold',
        type: 'threshold',
        description: 'Synchronicity awareness threshold reached - reality becoming more responsive',
        confidence: Math.min(1, syncCount / 10),
        dataPoints: ['Synchronicities'],
        discoveredAt: Date.now(),
        significance: 8
      })
    }
    
    setPatterns(newPatterns)
  }
  
  // AURA metrics
  const auraMetrics = useMemo(() => {
    return validateAURA({
      TES: 0.5 + fieldState.coherence * 0.35,
      VTR: 1.0 + fieldState.alignment * 1.2,
      PAI: 0.6 + fieldState.momentum * 0.3
    }, AURA_PRESETS.moderate)
  }, [fieldState])
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Emergence Dashboard</h1>
        <p className="text-zinc-500">Real-time field state and cross-data pattern recognition</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Field */}
        <div className="lg:col-span-2 space-y-6">
          {/* Field Visualization */}
          <div className="cascade-card overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-lg font-medium text-zinc-200">Field State</h3>
              <p className="text-xs text-zinc-500">Live coherence visualization</p>
            </div>
            <FieldVisualization fieldState={fieldState} />
          </div>
          
          {/* AURA Metrics */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">AURA Protocol Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-500">TES</span>
                  <span className={auraMetrics.TES >= 0.7 ? 'text-emerald-400' : 'text-amber-400'}>
                    {auraMetrics.TES.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${auraMetrics.TES >= 0.7 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${auraMetrics.TES * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-500">VTR</span>
                  <span className={auraMetrics.VTR >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}>
                    {auraMetrics.VTR.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${auraMetrics.VTR >= 1.5 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(auraMetrics.VTR / 3, 1) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-500">PAI</span>
                  <span className={auraMetrics.PAI >= 0.8 ? 'text-emerald-400' : 'text-amber-400'}>
                    {auraMetrics.PAI.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${auraMetrics.PAI >= 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${auraMetrics.PAI * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <p className={`text-xs mt-3 ${auraMetrics.valid ? 'text-emerald-400' : 'text-amber-400'}`}>
              {auraMetrics.valid ? '✓ All metrics passing' : `⚠ ${auraMetrics.warnings.length} metric(s) below threshold`}
            </p>
          </div>
          
          {/* Emergent Patterns */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">🔮 Emergent Patterns</h3>
            {patterns.length === 0 ? (
              <p className="text-sm text-zinc-500">Patterns emerge with more data. Keep practicing.</p>
            ) : (
              <div className="space-y-3">
                {patterns.map(pattern => (
                  <PatternCard key={pattern.id} pattern={pattern} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Field Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Coherence</span>
                  <span className="text-cyan-400">{(fieldState.coherence * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${fieldState.coherence * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Momentum</span>
                  <span className="text-purple-400">{(fieldState.momentum * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${fieldState.momentum * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Alignment</span>
                  <span className="text-emerald-400">{(fieldState.alignment * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${fieldState.alignment * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Entropy</span>
                  <span className="text-amber-400">{(fieldState.entropy * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${fieldState.entropy * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Data Streams */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">📊 Data Streams</h3>
            {dataStreams.length === 0 ? (
              <p className="text-sm text-zinc-500">No data yet. Start using CASCADE features.</p>
            ) : (
              <div className="space-y-2">
                {dataStreams.slice(0, 8).map(stream => (
                  <DataStreamCard key={stream.source} stream={stream} />
                ))}
              </div>
            )}
          </div>
          
          {/* LAMAGUE */}
          <div className="cascade-card p-6 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
            <p className="text-center font-mono text-purple-400 text-lg">
              ⟟ → ≋ → Ψ → Φ↑ → ✧ → ∥◁▷∥ → ⟲
            </p>
            <p className="text-center text-xs text-zinc-500 mt-2">
              The field emerges from consistent practice
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
