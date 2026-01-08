'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  calculateCoherenceField,
  validateAURA,
  calculateEarnedLight,
  AURA_PRESETS,
  type CoherenceField,
  type AURAMetrics,
  type EarnedLight
} from '@/lib/aura/protocol'

// ============================================================================
// TYPES
// ============================================================================

interface ResonanceLog {
  id: string
  field: CoherenceField
  aura: AURAMetrics
  earnedLight: EarnedLight
  note?: string
  timestamp: number
}

// ============================================================================
// COHERENCE RADAR VISUALIZATION
// ============================================================================

function CoherenceRadar({ field }: { field: CoherenceField }) {
  const dimensions = ['mental', 'emotional', 'physical', 'spiritual'] as const
  const labels = ['Mind', 'Heart', 'Body', 'Spirit']
  const colors = ['cyan', 'pink', 'emerald', 'purple']
  
  // Convert values to polygon points
  const centerX = 150
  const centerY = 150
  const maxRadius = 120
  
  const getPoint = (index: number, value: number): { x: number; y: number } => {
    const angle = (index / 4) * 2 * Math.PI - Math.PI / 2
    const radius = value * maxRadius
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }
  
  const points = dimensions.map((dim, i) => getPoint(i, field.dimensions[dim]))
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ')
  
  return (
    <div className="relative">
      <svg width="300" height="300" className="mx-auto">
        {/* Background rings */}
        {[0.25, 0.5, 0.75, 1].map((ring, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={maxRadius * ring}
            fill="none"
            stroke="rgb(63, 63, 70)"
            strokeWidth="1"
            strokeDasharray={i === 3 ? "0" : "4,4"}
          />
        ))}
        
        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const point = getPoint(i, 1)
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={point.x}
              y2={point.y}
              stroke="rgb(63, 63, 70)"
              strokeWidth="1"
            />
          )
        })}
        
        {/* Value polygon */}
        <polygon
          points={polygonPoints}
          fill="url(#coherenceGradient)"
          fillOpacity="0.3"
          stroke="url(#coherenceGradient)"
          strokeWidth="2"
        />
        
        {/* Value points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="6"
            fill={`rgb(var(--${colors[i]}-500))`}
            className="drop-shadow-lg"
          />
        ))}
        
        {/* Labels */}
        {dimensions.map((_, i) => {
          const labelPoint = getPoint(i, 1.2)
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-xs fill-${colors[i]}-400`}
              fill={i === 0 ? 'rgb(6, 182, 212)' : i === 1 ? 'rgb(236, 72, 153)' : i === 2 ? 'rgb(16, 185, 129)' : 'rgb(168, 85, 247)'}
            >
              {labels[i]}
            </text>
          )
        })}
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="coherenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(6, 182, 212)" />
            <stop offset="50%" stopColor="rgb(168, 85, 247)" />
            <stop offset="100%" stopColor="rgb(16, 185, 129)" />
          </linearGradient>
        </defs>
        
        {/* Center resonance indicator */}
        <circle
          cx={centerX}
          cy={centerY}
          r={20}
          fill={`rgba(168, 85, 247, ${field.resonance})`}
          className="animate-pulse"
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-bold"
          fill="white"
        >
          {Math.round(field.resonance * 100)}%
        </text>
      </svg>
      
      {/* Overall score */}
      <div className="text-center mt-4">
        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          {Math.round(field.overall * 100)}%
        </p>
        <p className="text-sm text-zinc-500">Overall Coherence</p>
      </div>
    </div>
  )
}

// ============================================================================
// AURA METRICS DISPLAY
// ============================================================================

function AURAMetricsDisplay({ metrics }: { metrics: AURAMetrics }) {
  const getColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'emerald'
    if (value >= threshold * 0.8) return 'amber'
    return 'red'
  }
  
  return (
    <div className="space-y-4">
      {/* TES */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-400">TES (Trust Entropy)</span>
          <span className={`text-${getColor(metrics.TES, 0.7)}-400`}>{metrics.TES.toFixed(2)}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-${getColor(metrics.TES, 0.7)}-500 transition-all duration-500`}
            style={{ width: `${metrics.TES * 100}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600 mt-1">Clarity over complexity</p>
      </div>
      
      {/* VTR */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-400">VTR (Value Transfer)</span>
          <span className={`text-${getColor(metrics.VTR / 3, 0.5)}-400`}>{metrics.VTR.toFixed(2)}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-${getColor(metrics.VTR / 3, 0.5)}-500 transition-all duration-500`}
            style={{ width: `${Math.min(metrics.VTR / 3, 1) * 100}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600 mt-1">Value created vs extracted</p>
      </div>
      
      {/* PAI */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-400">PAI (Purpose Alignment)</span>
          <span className={`text-${getColor(metrics.PAI, 0.8)}-400`}>{metrics.PAI.toFixed(2)}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-${getColor(metrics.PAI, 0.8)}-500 transition-all duration-500`}
            style={{ width: `${metrics.PAI * 100}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600 mt-1">Alignment with stated purpose</p>
      </div>
      
      {/* Validation Status */}
      <div className={`p-3 rounded-lg ${metrics.valid ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
        <div className="flex items-center gap-2">
          <span className={metrics.valid ? 'text-emerald-400' : 'text-amber-400'}>
            {metrics.valid ? '✓' : '⚠'}
          </span>
          <span className={`text-sm ${metrics.valid ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metrics.valid ? 'All metrics passing' : `${metrics.warnings.length} warning(s)`}
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// DIMENSION SLIDERS
// ============================================================================

function DimensionSliders({ 
  values, 
  onChange 
}: { 
  values: { mental: number; emotional: number; physical: number; spiritual: number }
  onChange: (dim: string, value: number) => void 
}) {
  const dimensions = [
    { key: 'mental', label: 'Mental', icon: '🧠', color: 'cyan' },
    { key: 'emotional', label: 'Emotional', icon: '💗', color: 'pink' },
    { key: 'physical', label: 'Physical', icon: '💪', color: 'emerald' },
    { key: 'spiritual', label: 'Spiritual', icon: '✨', color: 'purple' }
  ]
  
  return (
    <div className="space-y-4">
      {dimensions.map(dim => (
        <div key={dim.key}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400 flex items-center gap-2">
              <span>{dim.icon}</span>
              {dim.label}
            </span>
            <span className={`text-sm font-mono text-${dim.color}-400`}>
              {(values[dim.key as keyof typeof values] * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={values[dim.key as keyof typeof values] * 100}
            onChange={(e) => onChange(dim.key, parseInt(e.target.value) / 100)}
            className={`w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-${dim.color}-500`}
          />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ResonancePage() {
  const [dimensions, setDimensions] = useState({
    mental: 0.7,
    emotional: 0.6,
    physical: 0.8,
    spiritual: 0.5
  })
  
  const [field, setField] = useState<CoherenceField | null>(null)
  const [auraMetrics, setAuraMetrics] = useState<AURAMetrics | null>(null)
  const [earnedLight, setEarnedLight] = useState<EarnedLight | null>(null)
  const [logs, setLogs] = useState<ResonanceLog[]>([])
  const [note, setNote] = useState('')
  
  // Load logs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-resonance-logs')
      if (saved) setLogs(JSON.parse(saved))
    }
  }, [])
  
  // Recalculate on dimension change
  useEffect(() => {
    const newField = calculateCoherenceField(dimensions)
    setField(newField)
    
    // Simulate AURA metrics based on coherence
    const newAura = validateAURA({
      TES: 0.5 + newField.overall * 0.4,
      VTR: 1.0 + newField.overall * 1.5,
      PAI: 0.6 + newField.overall * 0.35
    }, AURA_PRESETS.moderate)
    setAuraMetrics(newAura)
    
    // Calculate earned light
    const newEL = calculateEarnedLight({
      recentActions: { succeeded: Math.round(newField.overall * 10), total: 10 },
      historicalActions: { succeeded: 75, total: 100 },
      influence: 0.5,
      consent: 0.8,
      tau: 0.1
    })
    setEarnedLight(newEL)
  }, [dimensions])
  
  const handleDimensionChange = useCallback((dim: string, value: number) => {
    setDimensions(prev => ({ ...prev, [dim]: value }))
  }, [])
  
  const logResonance = useCallback(() => {
    if (!field || !auraMetrics || !earnedLight) return
    
    const newLog: ResonanceLog = {
      id: `res-${Date.now()}`,
      field,
      aura: auraMetrics,
      earnedLight,
      note: note || undefined,
      timestamp: Date.now()
    }
    
    const updated = [newLog, ...logs].slice(0, 50)
    setLogs(updated)
    localStorage.setItem('cascade-resonance-logs', JSON.stringify(updated))
    setNote('')
  }, [field, auraMetrics, earnedLight, note, logs])
  
  if (!field || !auraMetrics || !earnedLight) {
    return <div className="p-8">Loading...</div>
  }
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Resonance Field</h1>
        <p className="text-zinc-500">AURA Protocol coherence tracking</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Radar */}
          <div className="cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
            <CoherenceRadar field={field} />
          </div>
          
          {/* Dimension Sliders */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Adjust Dimensions</h3>
            <DimensionSliders values={dimensions} onChange={handleDimensionChange} />
          </div>
          
          {/* Log Entry */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Log This State</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note about current state..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none mb-4"
              rows={2}
            />
            <button
              onClick={logResonance}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-zinc-900 font-medium rounded-lg"
            >
              Log Resonance State
            </button>
          </div>
        </div>
        
        {/* Metrics Sidebar */}
        <div className="space-y-6">
          {/* AURA Metrics */}
          <div className="cascade-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <h3 className="text-lg font-medium text-zinc-200">AURA Metrics</h3>
            </div>
            <AURAMetricsDisplay metrics={auraMetrics} />
          </div>
          
          {/* Earned Light */}
          <div className="cascade-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">✧</span>
              <h3 className="text-lg font-medium text-zinc-200">Earned Light</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-500">Short-term Reliability</span>
                <span className="text-sm text-cyan-400">{(earnedLight.shortTermReliability * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-500">Long-term Reliability</span>
                <span className="text-sm text-purple-400">{(earnedLight.longTermReliability * 100).toFixed(0)}%</span>
              </div>
              <div className="h-px bg-zinc-800" />
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Earned Light (EL)</span>
                <span className="text-lg font-bold text-amber-400">{(earnedLight.earnedLight * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Governance Capacity</span>
                <span className="text-sm text-emerald-400">{(earnedLight.governanceCapacity * 100).toFixed(0)}%</span>
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-4 italic">
              "Authority is proportional to earned coherence."
            </p>
          </div>
          
          {/* Recent Logs */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Recent Logs</h3>
            {logs.length === 0 ? (
              <p className="text-sm text-zinc-500">No logs yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.slice(0, 10).map(log => (
                  <div key={log.id} className="p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span>{Math.round(log.field.overall * 100)}%</span>
                    </div>
                    {log.note && (
                      <p className="text-sm text-zinc-400 line-clamp-1">{log.note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* AURA Protocol Footer */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-emerald-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">AURA Protocol v2.0</p>
            <p className="font-mono text-purple-400 text-sm">⟟ → ≋ → Ψ → Φ↑ → ✧ → ∥◁▷∥ → ⟲</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Constitutional AI Framework</p>
            <p className="text-xs text-zinc-600">Light is earned, not given</p>
          </div>
        </div>
      </div>
    </div>
  )
}
