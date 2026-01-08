'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface CoreValue {
  id: string
  title: string
  description: string
  lamague: string
  examples: string[] // How this shows up in action
  violations: string[] // What violating this looks like
  createdAt: number
  lastReflectedAt: number
  strengthScore: number // 0-1, how strongly you're living this
  order: number
}

interface ValueReflection {
  id: string
  valueId: string
  timestamp: number
  alignment: 1 | 2 | 3 | 4 | 5 // How aligned you were
  note: string
}

// ============================================================================
// VALUE CARD
// ============================================================================

function ValueCard({ 
  value, 
  reflections,
  onSelect,
  onReflect
}: { 
  value: CoreValue
  reflections: ValueReflection[]
  onSelect: () => void
  onReflect: (alignment: number, note: string) => void
}) {
  const [showReflect, setShowReflect] = useState(false)
  const [alignment, setAlignment] = useState(3)
  const [note, setNote] = useState('')
  
  const recentReflections = reflections.slice(-7)
  const avgAlignment = recentReflections.length > 0
    ? recentReflections.reduce((sum, r) => sum + r.alignment, 0) / recentReflections.length
    : 0
  
  const handleReflect = () => {
    onReflect(alignment, note)
    setShowReflect(false)
    setNote('')
    setAlignment(3)
  }
  
  return (
    <div className="cascade-card p-5 hover:border-purple-500/30 transition-all cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-mono text-purple-400">{value.lamague}</span>
          <div>
            <h3 className="text-lg font-medium text-zinc-200">{value.title}</h3>
            <p className="text-sm text-zinc-500">{value.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-cyan-400">{Math.round(value.strengthScore * 100)}%</p>
          <p className="text-xs text-zinc-500">alignment</p>
        </div>
      </div>
      
      {/* Alignment History */}
      {recentReflections.length > 0 && (
        <div className="flex items-center gap-1 mb-3">
          {recentReflections.map((r, i) => (
            <div
              key={r.id}
              className={`flex-1 h-2 rounded-full ${
                r.alignment >= 4 ? 'bg-emerald-500' :
                r.alignment === 3 ? 'bg-cyan-500' :
                r.alignment === 2 ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              title={`${r.alignment}/5`}
            />
          ))}
        </div>
      )}
      
      {/* Examples */}
      {value.examples.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-zinc-500 mb-1">Shows up as:</p>
          <div className="flex flex-wrap gap-1">
            {value.examples.slice(0, 3).map((ex, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                {ex}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Quick Reflect */}
      {showReflect ? (
        <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg" onClick={e => e.stopPropagation()}>
          <p className="text-xs text-zinc-500 mb-2">How aligned were you today?</p>
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setAlignment(n)}
                className={`flex-1 py-2 rounded text-sm transition-colors ${
                  alignment === n
                    ? n >= 4 ? 'bg-emerald-500/30 text-emerald-300' :
                      n === 3 ? 'bg-cyan-500/30 text-cyan-300' :
                      'bg-red-500/30 text-red-300'
                    : 'bg-zinc-700 text-zinc-500 hover:bg-zinc-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Quick note (optional)"
            className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:border-purple-500 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowReflect(false)}
              className="flex-1 py-1.5 bg-zinc-700 text-zinc-400 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleReflect}
              className="flex-1 py-1.5 bg-purple-500 text-zinc-900 rounded text-sm font-medium"
            >
              Log
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setShowReflect(true) }}
          className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-sm transition-colors"
        >
          Quick Reflect
        </button>
      )}
    </div>
  )
}

// ============================================================================
// CREATE/EDIT VALUE FORM
// ============================================================================

function ValueForm({ 
  value,
  onSave, 
  onCancel 
}: { 
  value?: CoreValue
  onSave: (data: Partial<CoreValue>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(value?.title || '')
  const [description, setDescription] = useState(value?.description || '')
  const [lamague, setLamague] = useState(value?.lamague || 'Ψ')
  const [examples, setExamples] = useState<string[]>(value?.examples || [])
  const [violations, setViolations] = useState<string[]>(value?.violations || [])
  const [newExample, setNewExample] = useState('')
  const [newViolation, setNewViolation] = useState('')
  
  const lamagueOptions = ['⟟', '≋', 'Ψ', 'Φ↑', '✧', '∥◁▷∥', '⟲', 'ε']
  
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">
        {value ? 'Edit Core Value' : 'Define Core Value'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-zinc-500 block mb-1">Value Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Integrity, Growth, Connection"
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        <div>
          <label className="text-sm text-zinc-500 block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this value mean to you?"
            rows={2}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>
        
        <div>
          <label className="text-sm text-zinc-500 block mb-1">LAMAGUE Symbol</label>
          <div className="flex gap-1">
            {lamagueOptions.map((sym) => (
              <button
                key={sym}
                onClick={() => setLamague(sym)}
                className={`flex-1 py-3 rounded text-xl font-mono transition-colors ${
                  lamague === sym
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
        
        {/* Examples */}
        <div>
          <label className="text-sm text-zinc-500 block mb-1">How this shows up in action</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newExample.trim()) {
                  setExamples([...examples, newExample.trim()])
                  setNewExample('')
                }
              }}
              placeholder="e.g., Speaking truth even when hard"
              className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => {
                if (newExample.trim()) {
                  setExamples([...examples, newExample.trim()])
                  setNewExample('')
                }
              }}
              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded text-sm"
            >
              Add
            </button>
          </div>
          {examples.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {examples.map((ex, i) => (
                <span 
                  key={i} 
                  className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded cursor-pointer hover:bg-emerald-500/20"
                  onClick={() => setExamples(examples.filter((_, j) => j !== i))}
                >
                  {ex} ×
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Violations */}
        <div>
          <label className="text-sm text-zinc-500 block mb-1">What violating this looks like</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newViolation}
              onChange={(e) => setNewViolation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newViolation.trim()) {
                  setViolations([...violations, newViolation.trim()])
                  setNewViolation('')
                }
              }}
              placeholder="e.g., Staying silent to avoid conflict"
              className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:border-red-500"
            />
            <button
              onClick={() => {
                if (newViolation.trim()) {
                  setViolations([...violations, newViolation.trim()])
                  setNewViolation('')
                }
              }}
              className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded text-sm"
            >
              Add
            </button>
          </div>
          {violations.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {violations.map((v, i) => (
                <span 
                  key={i} 
                  className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded cursor-pointer hover:bg-red-500/20"
                  onClick={() => setViolations(violations.filter((_, j) => j !== i))}
                >
                  {v} ×
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({
              title,
              description,
              lamague,
              examples,
              violations,
              strengthScore: value?.strengthScore ?? 0.5
            })}
            disabled={!title.trim()}
            className="flex-1 py-2 bg-purple-500 text-zinc-900 font-medium rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50"
          >
            {value ? 'Save Changes' : 'Define Value'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ValuesPage() {
  const [values, setValues] = useState<CoreValue[]>([])
  const [reflections, setReflections] = useState<ValueReflection[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingValue, setEditingValue] = useState<CoreValue | null>(null)
  const [selectedValue, setSelectedValue] = useState<CoreValue | null>(null)
  
  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedValues = localStorage.getItem('cascade-values')
      const savedReflections = localStorage.getItem('cascade-value-reflections')
      
      if (savedValues) setValues(JSON.parse(savedValues))
      if (savedReflections) setReflections(JSON.parse(savedReflections))
    }
  }, [])
  
  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cascade-values', JSON.stringify(values))
      localStorage.setItem('cascade-value-reflections', JSON.stringify(reflections))
    }
  }, [values, reflections])
  
  const handleSaveValue = (data: Partial<CoreValue>) => {
    if (editingValue) {
      setValues(prev => prev.map(v => 
        v.id === editingValue.id ? { ...v, ...data } : v
      ))
    } else {
      const newValue: CoreValue = {
        ...data as Omit<CoreValue, 'id' | 'createdAt' | 'lastReflectedAt' | 'order'>,
        id: `value-${Date.now()}`,
        createdAt: Date.now(),
        lastReflectedAt: Date.now(),
        order: values.length
      }
      setValues(prev => [...prev, newValue])
    }
    setShowForm(false)
    setEditingValue(null)
  }
  
  const handleReflect = (valueId: string, alignment: number, note: string) => {
    const reflection: ValueReflection = {
      id: `ref-${Date.now()}`,
      valueId,
      timestamp: Date.now(),
      alignment: alignment as 1 | 2 | 3 | 4 | 5,
      note
    }
    
    setReflections(prev => [...prev, reflection])
    
    // Update strength score based on recent reflections
    const valueReflections = [...reflections, reflection].filter(r => r.valueId === valueId).slice(-14)
    const avgAlignment = valueReflections.reduce((sum, r) => sum + r.alignment, 0) / valueReflections.length
    const newStrength = avgAlignment / 5
    
    setValues(prev => prev.map(v => 
      v.id === valueId 
        ? { ...v, strengthScore: newStrength, lastReflectedAt: Date.now() } 
        : v
    ))
  }
  
  // Calculate overall alignment
  const overallAlignment = values.length > 0
    ? values.reduce((sum, v) => sum + v.strengthScore, 0) / values.length
    : 0
  
  const getValueReflections = (valueId: string) => 
    reflections.filter(r => r.valueId === valueId)
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Core Values</h1>
            <p className="text-zinc-500">Your invariants — the unchanging foundation of who you are</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-zinc-900 font-medium rounded-lg transition-colors"
          >
            + Define Value
          </button>
        </div>
      </header>
      
      {/* Overall Alignment */}
      <div className="cascade-card p-6 mb-8 bg-gradient-to-br from-purple-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 mb-1">Overall Value Alignment</p>
            <p className="text-4xl font-bold text-purple-400">{Math.round(overallAlignment * 100)}%</p>
            <p className="text-xs text-zinc-500 mt-1">Based on {values.length} core values</p>
          </div>
          <div className="text-right">
            <p className="text-6xl font-mono text-purple-400/50">Ψ</p>
            <p className="text-xs text-zinc-500">The Invariant</p>
          </div>
        </div>
        
        {/* Value strength bars */}
        {values.length > 0 && (
          <div className="mt-6 space-y-2">
            {values.map(v => (
              <div key={v.id} className="flex items-center gap-3">
                <span className="w-6 text-center font-mono text-purple-400">{v.lamague}</span>
                <span className="w-24 text-sm text-zinc-400 truncate">{v.title}</span>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      v.strengthScore >= 0.8 ? 'bg-emerald-500' :
                      v.strengthScore >= 0.6 ? 'bg-cyan-500' :
                      v.strengthScore >= 0.4 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${v.strengthScore * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm text-zinc-500">
                  {Math.round(v.strengthScore * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Values List */}
        <div className="space-y-4">
          {showForm || editingValue ? (
            <ValueForm
              value={editingValue || undefined}
              onSave={handleSaveValue}
              onCancel={() => {
                setShowForm(false)
                setEditingValue(null)
              }}
            />
          ) : values.length === 0 ? (
            <div className="cascade-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-3xl font-mono text-purple-400">Ψ</span>
              </div>
              <h3 className="text-lg font-medium text-zinc-200 mb-2">Define Your Invariants</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Core values are the unchanging foundation of your identity.
                They guide decisions when everything else is uncertain.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="text-purple-400 hover:text-purple-300"
              >
                Define your first value →
              </button>
            </div>
          ) : (
            values.map(value => (
              <ValueCard
                key={value.id}
                value={value}
                reflections={getValueReflections(value.id)}
                onSelect={() => setSelectedValue(value)}
                onReflect={(alignment, note) => handleReflect(value.id, alignment, note)}
              />
            ))
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {selectedValue ? (
            <div className="cascade-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-mono text-purple-400">{selectedValue.lamague}</span>
                  <h3 className="text-xl font-medium text-zinc-200">{selectedValue.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedValue(null)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-zinc-400 mb-4">{selectedValue.description}</p>
              
              {selectedValue.examples.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 mb-2">Living this value looks like:</p>
                  <ul className="space-y-1">
                    {selectedValue.examples.map((ex, i) => (
                      <li key={i} className="text-sm text-emerald-400 flex items-center gap-2">
                        <span className="text-emerald-500">✓</span> {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedValue.violations.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 mb-2">Violating this value looks like:</p>
                  <ul className="space-y-1">
                    {selectedValue.violations.map((v, i) => (
                      <li key={i} className="text-sm text-red-400 flex items-center gap-2">
                        <span className="text-red-500">✗</span> {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Recent Reflections */}
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Recent Reflections</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getValueReflections(selectedValue.id).slice(-5).reverse().map(r => (
                    <div key={r.id} className="text-xs p-2 bg-zinc-800/50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${
                          r.alignment >= 4 ? 'text-emerald-400' :
                          r.alignment === 3 ? 'text-cyan-400' :
                          'text-red-400'
                        }`}>
                          {r.alignment}/5
                        </span>
                        <span className="text-zinc-600">
                          {new Date(r.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {r.note && <p className="text-zinc-400">{r.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => setEditingValue(selectedValue)}
                className="w-full mt-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-sm transition-colors"
              >
                Edit Value
              </button>
            </div>
          ) : (
            <div className="cascade-card p-6">
              <h3 className="text-lg font-medium text-zinc-200 mb-4">The Invariant Foundation</h3>
              <div className="space-y-4 text-sm text-zinc-400">
                <p>
                  Core values are your <span className="text-purple-400">Ψ (Psi)</span> — 
                  the unchanging foundation that defines who you are regardless of circumstance.
                </p>
                <p>
                  They are the <span className="text-cyan-400">survivor's constant (ε)</span> of identity.
                  Everything else can be stripped away, but these remain.
                </p>
                <p>
                  Regular reflection keeps them <span className="text-emerald-400">alive and actionable</span>,
                  not just abstract ideals.
                </p>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <p className="font-mono text-purple-400 text-xs">
                    Identity = Σ(Values × Alignment × Time)
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Reflection Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">{values.length}</p>
                <p className="text-xs text-zinc-500">Core Values</p>
              </div>
              <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-2xl font-bold text-cyan-400">{reflections.length}</p>
                <p className="text-xs text-zinc-500">Reflections</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
