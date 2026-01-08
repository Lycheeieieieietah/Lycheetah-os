'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface TemporalAnchor {
  id: string
  title: string
  description: string
  futureDate: number
  futureSelf: string  // Description of who you'll be
  pullStrength: number  // 1-10 how strongly this pulls you
  currentAlignment: number  // 0-1 how aligned current actions are
  milestones: AnchorMilestone[]
  lamague: string
  status: 'active' | 'achieved' | 'released'
  createdAt: number
  lastReflection?: number
}

interface AnchorMilestone {
  id: string
  title: string
  dueDate?: number
  completed: boolean
  completedAt?: number
}

interface AnchorReflection {
  id: string
  anchorId: string
  content: string
  alignmentBefore: number
  alignmentAfter: number
  timestamp: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIME_HORIZONS = [
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
  { label: '3 Years', days: 1095 },
  { label: '5 Years', days: 1825 }
]

const ANCHOR_TEMPLATES = [
  { title: 'Career Evolution', futureSelf: 'I am thriving in meaningful work that uses my gifts...', lamague: 'Φ↑' },
  { title: 'Physical Vitality', futureSelf: 'My body is strong, energized, and fully alive...', lamague: '≋' },
  { title: 'Deep Relationships', futureSelf: 'I am surrounded by love, seen and known by those who matter...', lamague: '✧' },
  { title: 'Financial Freedom', futureSelf: 'Money flows to me easily and I use it to create value...', lamague: 'Φ↑' },
  { title: 'Creative Mastery', futureSelf: 'I create work that moves people and expresses my truth...', lamague: '✧' },
  { title: 'Inner Peace', futureSelf: 'I am at peace with myself, grounded in my invariant...', lamague: '⟟' }
]

// ============================================================================
// ANCHOR CARD
// ============================================================================

function AnchorCard({ 
  anchor, 
  onUpdate,
  onReflect 
}: { 
  anchor: TemporalAnchor
  onUpdate: (updated: TemporalAnchor) => void
  onReflect: () => void
}) {
  const daysUntil = Math.ceil((anchor.futureDate - Date.now()) / (1000 * 60 * 60 * 24))
  const progress = anchor.milestones.length > 0
    ? anchor.milestones.filter(m => m.completed).length / anchor.milestones.length
    : 0
  
  const toggleMilestone = (milestoneId: string) => {
    const updated = {
      ...anchor,
      milestones: anchor.milestones.map(m => 
        m.id === milestoneId 
          ? { ...m, completed: !m.completed, completedAt: !m.completed ? Date.now() : undefined }
          : m
      )
    }
    onUpdate(updated)
  }
  
  const adjustAlignment = (delta: number) => {
    const newAlignment = Math.max(0, Math.min(1, anchor.currentAlignment + delta))
    onUpdate({ ...anchor, currentAlignment: newAlignment })
  }
  
  return (
    <div className={`cascade-card p-6 ${
      anchor.status === 'achieved' ? 'border-emerald-500/30 bg-emerald-500/5' :
      anchor.status === 'released' ? 'opacity-60' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-mono text-purple-400">{anchor.lamague}</span>
            <h3 className="text-lg font-medium text-zinc-200">{anchor.title}</h3>
          </div>
          <p className="text-sm text-zinc-500">
            {daysUntil > 0 ? `${daysUntil} days until target` : 'Target date reached'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-cyan-400">{anchor.pullStrength}</p>
          <p className="text-xs text-zinc-500">Pull Strength</p>
        </div>
      </div>
      
      {/* Future Self Vision */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg mb-4">
        <p className="text-xs text-purple-400 mb-1">Future Self</p>
        <p className="text-sm text-zinc-300 italic">"{anchor.futureSelf}"</p>
      </div>
      
      {/* Alignment Meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Current Alignment</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustAlignment(-0.1)}
              className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              -
            </button>
            <span className="text-sm text-cyan-400 w-12 text-center">
              {Math.round(anchor.currentAlignment * 100)}%
            </span>
            <button
              onClick={() => adjustAlignment(0.1)}
              className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              +
            </button>
          </div>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
            style={{ width: `${anchor.currentAlignment * 100}%` }}
          />
        </div>
      </div>
      
      {/* Milestones */}
      {anchor.milestones.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-zinc-400 mb-2">Milestones ({Math.round(progress * 100)}%)</p>
          <div className="space-y-1">
            {anchor.milestones.map(milestone => (
              <button
                key={milestone.id}
                onClick={() => toggleMilestone(milestone.id)}
                className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                  milestone.completed
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <span>{milestone.completed ? '✓' : '○'}</span>
                <span className={milestone.completed ? 'line-through' : ''}>{milestone.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onReflect}
          className="flex-1 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30"
        >
          Reflect
        </button>
        {anchor.status === 'active' && daysUntil <= 0 && (
          <button
            onClick={() => onUpdate({ ...anchor, status: 'achieved' })}
            className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30"
          >
            Mark Achieved
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// CREATE ANCHOR FORM
// ============================================================================

function CreateAnchorForm({ 
  onSave, 
  onCancel 
}: { 
  onSave: (anchor: Omit<TemporalAnchor, 'id' | 'createdAt'>) => void
  onCancel: () => void 
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [futureSelf, setFutureSelf] = useState('')
  const [pullStrength, setPullStrength] = useState(7)
  const [horizon, setHorizon] = useState(365)
  const [lamague, setLamague] = useState('Φ↑')
  const [milestones, setMilestones] = useState<string[]>([''])
  
  const applyTemplate = (template: typeof ANCHOR_TEMPLATES[0]) => {
    setTitle(template.title)
    setFutureSelf(template.futureSelf)
    setLamague(template.lamague)
  }
  
  const updateMilestone = (index: number, value: string) => {
    const updated = [...milestones]
    updated[index] = value
    setMilestones(updated)
  }
  
  const addMilestone = () => {
    setMilestones([...milestones, ''])
  }
  
  const handleSubmit = () => {
    if (!title.trim() || !futureSelf.trim()) return
    
    onSave({
      title,
      description,
      futureSelf,
      futureDate: Date.now() + horizon * 24 * 60 * 60 * 1000,
      pullStrength,
      currentAlignment: 0.3,
      milestones: milestones
        .filter(m => m.trim())
        .map((m, i) => ({
          id: `ms-${Date.now()}-${i}`,
          title: m,
          completed: false
        })),
      lamague,
      status: 'active'
    })
  }
  
  return (
    <div className="cascade-card p-6">
      <h2 className="text-xl font-bold text-zinc-100 mb-6">Create Temporal Anchor</h2>
      
      {/* Templates */}
      <div className="mb-6">
        <p className="text-sm text-zinc-400 mb-2">Quick Templates</p>
        <div className="flex flex-wrap gap-2">
          {ANCHOR_TEMPLATES.map(template => (
            <button
              key={template.title}
              onClick={() => applyTemplate(template)}
              className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded text-sm hover:bg-zinc-700"
            >
              {template.lamague} {template.title}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Anchor Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What future are you anchoring to?"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Future Self Vision</label>
          <textarea
            value={futureSelf}
            onChange={(e) => setFutureSelf(e.target.value)}
            placeholder="Describe who you are in this future... (Write in present tense)"
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Time Horizon</label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
            >
              {TIME_HORIZONS.map(h => (
                <option key={h.days} value={h.days}>{h.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Pull Strength (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={pullStrength}
              onChange={(e) => setPullStrength(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-center text-cyan-400 font-bold">{pullStrength}</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">LAMAGUE Symbol</label>
          <div className="flex gap-2">
            {['⟟', '≋', 'Ψ', 'Φ↑', '✧', '∥◁▷∥', '⟲'].map(sym => (
              <button
                key={sym}
                onClick={() => setLamague(sym)}
                className={`px-4 py-2 rounded-lg font-mono text-lg ${
                  lamague === sym
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Milestones (Optional)</label>
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <input
                key={i}
                type="text"
                value={m}
                onChange={(e) => updateMilestone(i, e.target.value)}
                placeholder={`Milestone ${i + 1}...`}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm"
              />
            ))}
          </div>
          <button
            onClick={addMilestone}
            className="mt-2 text-sm text-cyan-400"
          >
            + Add Milestone
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !futureSelf.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
          >
            Set Anchor
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TemporalAnchorsPage() {
  const [anchors, setAnchors] = useState<TemporalAnchor[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<'active' | 'achieved' | 'all'>('active')
  
  // Load anchors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-temporal-anchors')
      if (saved) setAnchors(JSON.parse(saved))
    }
  }, [])
  
  const saveAnchor = (anchor: Omit<TemporalAnchor, 'id' | 'createdAt'>) => {
    const newAnchor: TemporalAnchor = {
      ...anchor,
      id: `anchor-${Date.now()}`,
      createdAt: Date.now()
    }
    
    const updated = [newAnchor, ...anchors]
    setAnchors(updated)
    localStorage.setItem('cascade-temporal-anchors', JSON.stringify(updated))
    setShowCreate(false)
  }
  
  const updateAnchor = (updated: TemporalAnchor) => {
    const newAnchors = anchors.map(a => a.id === updated.id ? updated : a)
    setAnchors(newAnchors)
    localStorage.setItem('cascade-temporal-anchors', JSON.stringify(newAnchors))
  }
  
  const filteredAnchors = filter === 'all' 
    ? anchors 
    : anchors.filter(a => a.status === filter)
  
  // Stats
  const activeAnchors = anchors.filter(a => a.status === 'active')
  const avgAlignment = activeAnchors.length > 0
    ? activeAnchors.reduce((sum, a) => sum + a.currentAlignment, 0) / activeAnchors.length
    : 0
  const totalPull = activeAnchors.reduce((sum, a) => sum + a.pullStrength, 0)
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Temporal Anchors</h1>
        <p className="text-zinc-500">Set intentions that pull you toward your future self</p>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="cascade-card p-4 text-center bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
          <p className="text-3xl font-bold text-cyan-400">{activeAnchors.length}</p>
          <p className="text-xs text-zinc-500">Active Anchors</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{Math.round(avgAlignment * 100)}%</p>
          <p className="text-xs text-zinc-500">Avg Alignment</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{totalPull}</p>
          <p className="text-xs text-zinc-500">Total Pull Force</p>
        </div>
      </div>
      
      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['active', 'achieved', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === f
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      {showCreate ? (
        <CreateAnchorForm onSave={saveAnchor} onCancel={() => setShowCreate(false)} />
      ) : (
        <>
          <button
            onClick={() => setShowCreate(true)}
            className="w-full mb-6 py-4 cascade-card text-center text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
          >
            + Create New Temporal Anchor
          </button>
          
          {filteredAnchors.length === 0 ? (
            <div className="cascade-card p-12 text-center">
              <p className="text-4xl mb-4">⚓</p>
              <p className="text-zinc-400">No anchors yet</p>
              <p className="text-sm text-zinc-600">Set your first anchor to your future self</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAnchors.map(anchor => (
                <AnchorCard 
                  key={anchor.id} 
                  anchor={anchor} 
                  onUpdate={updateAnchor}
                  onReflect={() => {/* TODO: reflection modal */}}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Philosophy */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">⚓ The Physics of Temporal Anchoring</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Your future self already exists in possibility space. By creating a vivid, detailed anchor, 
          you establish a gravitational pull that influences present decisions. The stronger the anchor 
          (clarity + emotion + pull strength), the more it bends your trajectory toward that future.
        </p>
        <p className="text-sm text-zinc-500 italic">
          "The future is not a destination but an attractor. Set your anchors wisely."
        </p>
      </div>
    </div>
  )
}
