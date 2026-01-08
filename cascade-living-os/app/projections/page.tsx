'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

type ProjectionTimeframe = '1w' | '1m' | '3m' | '1y' | '5y'
type ProjectionType = 'optimistic' | 'realistic' | 'pessimistic'

interface Projection {
  id: string
  title: string
  description: string
  timeframe: ProjectionTimeframe
  scenarios: {
    optimistic: string
    realistic: string
    pessimistic: string
  }
  signals: Signal[]
  outcome?: ProjectionType
  outcomeNote?: string
  lamague: string
  createdAt: number
  resolvedAt?: number
}

interface Signal {
  id: string
  description: string
  detected: boolean
  timestamp?: number
}

// ============================================================================
// PROJECTION CARD
// ============================================================================

function ProjectionCard({
  projection,
  onUpdate,
  onAddSignal
}: {
  projection: Projection
  onUpdate: (updates: Partial<Projection>) => void
  onAddSignal: (signal: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [newSignal, setNewSignal] = useState('')
  
  const timeframeLabels: Record<ProjectionTimeframe, string> = {
    '1w': '1 Week',
    '1m': '1 Month',
    '3m': '3 Months',
    '1y': '1 Year',
    '5y': '5 Years'
  }
  
  const isResolved = projection.outcome !== undefined
  const detectedSignals = projection.signals.filter(s => s.detected).length
  
  return (
    <div className={`cascade-card p-5 ${isResolved ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
            {timeframeLabels[projection.timeframe]}
          </span>
          {isResolved && (
            <span className={`px-2 py-0.5 text-xs rounded ${
              projection.outcome === 'optimistic' ? 'bg-emerald-500/20 text-emerald-400' :
              projection.outcome === 'pessimistic' ? 'bg-red-500/20 text-red-400' :
              'bg-zinc-500/20 text-zinc-400'
            }`}>
              {projection.outcome}
            </span>
          )}
        </div>
        <span className="font-mono text-purple-400">{projection.lamague}</span>
      </div>
      
      <h3 className="text-lg font-medium text-zinc-200 mb-2">{projection.title}</h3>
      <p className="text-sm text-zinc-500 mb-4">{projection.description}</p>
      
      {/* Scenarios */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={`p-3 rounded text-xs ${
          projection.outcome === 'optimistic' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-zinc-800/50'
        }`}>
          <p className="text-emerald-400 font-medium mb-1">Optimistic</p>
          <p className="text-zinc-400">{projection.scenarios.optimistic}</p>
        </div>
        <div className={`p-3 rounded text-xs ${
          projection.outcome === 'realistic' ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-zinc-800/50'
        }`}>
          <p className="text-cyan-400 font-medium mb-1">Realistic</p>
          <p className="text-zinc-400">{projection.scenarios.realistic}</p>
        </div>
        <div className={`p-3 rounded text-xs ${
          projection.outcome === 'pessimistic' ? 'bg-red-500/20 border border-red-500/30' : 'bg-zinc-800/50'
        }`}>
          <p className="text-red-400 font-medium mb-1">Pessimistic</p>
          <p className="text-zinc-400">{projection.scenarios.pessimistic}</p>
        </div>
      </div>
      
      {/* Signals */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500">Signals ({detectedSignals}/{projection.signals.length})</p>
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-cyan-400">
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
        
        {expanded && (
          <div className="space-y-1">
            {projection.signals.map(signal => (
              <div 
                key={signal.id}
                className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded text-xs"
              >
                <button
                  onClick={() => {
                    const updated = projection.signals.map(s => 
                      s.id === signal.id ? { ...s, detected: !s.detected, timestamp: Date.now() } : s
                    )
                    onUpdate({ signals: updated })
                  }}
                  className={`w-4 h-4 rounded border ${
                    signal.detected 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'border-zinc-600'
                  }`}
                >
                  {signal.detected && <span className="text-white text-xs">✓</span>}
                </button>
                <span className={signal.detected ? 'text-zinc-300' : 'text-zinc-500'}>
                  {signal.description}
                </span>
              </div>
            ))}
            
            {/* Add signal */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSignal}
                onChange={(e) => setNewSignal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSignal.trim()) {
                    onAddSignal(newSignal.trim())
                    setNewSignal('')
                  }
                }}
                placeholder="Add signal..."
                className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Resolve */}
      {!isResolved && (
        <div className="flex gap-2">
          {(['optimistic', 'realistic', 'pessimistic'] as ProjectionType[]).map(type => (
            <button
              key={type}
              onClick={() => onUpdate({ outcome: type, resolvedAt: Date.now() })}
              className={`flex-1 py-2 rounded text-xs transition-colors ${
                type === 'optimistic' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' :
                type === 'pessimistic' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ProjectionsPage() {
  const [projections, setProjections] = useState<Projection[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active')
  
  // Form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeframe, setTimeframe] = useState<ProjectionTimeframe>('1m')
  const [optimistic, setOptimistic] = useState('')
  const [realistic, setRealistic] = useState('')
  const [pessimistic, setPessimistic] = useState('')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-projections')
      if (saved) setProjections(JSON.parse(saved))
    }
  }, [])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cascade-projections', JSON.stringify(projections))
    }
  }, [projections])
  
  const addProjection = () => {
    if (!title.trim()) return
    
    const projection: Projection = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      timeframe,
      scenarios: {
        optimistic: optimistic.trim() || 'Best case outcome',
        realistic: realistic.trim() || 'Most likely outcome',
        pessimistic: pessimistic.trim() || 'Worst case outcome'
      },
      signals: [],
      lamague: 'Ψ',
      createdAt: Date.now()
    }
    
    setProjections(prev => [projection, ...prev])
    setTitle('')
    setDescription('')
    setOptimistic('')
    setRealistic('')
    setPessimistic('')
    setShowForm(false)
  }
  
  const updateProjection = (id: string, updates: Partial<Projection>) => {
    setProjections(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ))
  }
  
  const addSignal = (projectionId: string, description: string) => {
    const signal: Signal = {
      id: `sig-${Date.now()}`,
      description,
      detected: false
    }
    setProjections(prev => prev.map(p => 
      p.id === projectionId 
        ? { ...p, signals: [...p.signals, signal] }
        : p
    ))
  }
  
  // Filter
  const filtered = projections.filter(p => {
    if (filter === 'active') return !p.outcome
    if (filter === 'resolved') return p.outcome
    return true
  })
  
  // Stats
  const active = projections.filter(p => !p.outcome).length
  const resolved = projections.filter(p => p.outcome).length
  const optimisticOutcomes = projections.filter(p => p.outcome === 'optimistic').length
  const accuracy = resolved > 0 
    ? projections.filter(p => p.outcome === 'realistic').length / resolved 
    : 0
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Projections</h1>
            <p className="text-zinc-500">Model future scenarios and track signals</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-zinc-900 font-medium rounded-lg"
          >
            + New Projection
          </button>
        </div>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{active}</p>
          <p className="text-xs text-zinc-500">Active</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{resolved}</p>
          <p className="text-xs text-zinc-500">Resolved</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{optimisticOutcomes}</p>
          <p className="text-xs text-zinc-500">Optimistic</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{Math.round(accuracy * 100)}%</p>
          <p className="text-xs text-zinc-500">Realistic Rate</p>
        </div>
      </div>
      
      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'resolved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Form */}
      {showForm && (
        <div className="cascade-card p-6 mb-6">
          <h3 className="text-lg font-medium text-zinc-200 mb-4">New Projection</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you projecting?"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
            />
            
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context and details..."
              rows={2}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
            />
            
            <div>
              <label className="text-xs text-zinc-500 block mb-2">Timeframe</label>
              <div className="flex gap-2">
                {(['1w', '1m', '3m', '1y', '5y'] as ProjectionTimeframe[]).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`flex-1 py-2 rounded text-sm ${
                      timeframe === tf
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-emerald-400 block mb-1">Optimistic</label>
                <input
                  type="text"
                  value={optimistic}
                  onChange={(e) => setOptimistic(e.target.value)}
                  placeholder="Best case..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs text-cyan-400 block mb-1">Realistic</label>
                <input
                  type="text"
                  value={realistic}
                  onChange={(e) => setRealistic(e.target.value)}
                  placeholder="Most likely..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs text-red-400 block mb-1">Pessimistic</label>
                <input
                  type="text"
                  value={pessimistic}
                  onChange={(e) => setPessimistic(e.target.value)}
                  placeholder="Worst case..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 bg-zinc-800 text-zinc-400 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addProjection}
                disabled={!title.trim()}
                className="flex-1 py-2 bg-purple-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Projections List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="cascade-card p-8 text-center">
            <p className="text-zinc-500">No projections found</p>
          </div>
        ) : (
          filtered.map(p => (
            <ProjectionCard
              key={p.id}
              projection={p}
              onUpdate={(updates) => updateProjection(p.id, updates)}
              onAddSignal={(desc) => addSignal(p.id, desc)}
            />
          ))
        )}
      </div>
      
      {/* Philosophy */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">Ψ Projection Wisdom</h3>
        <p className="text-sm text-zinc-400">
          Projections make your mental models explicit and testable. By defining 
          optimistic, realistic, and pessimistic scenarios, you prepare for all 
          outcomes. Tracking signals helps you notice which reality is unfolding. 
          Over time, this improves your judgment and reduces anxiety about the unknown.
        </p>
      </div>
    </div>
  )
}
