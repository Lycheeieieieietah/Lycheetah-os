'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface Mantra {
  id: string
  text: string
  lamague: string
  category: 'identity' | 'action' | 'mindset' | 'sovereignty' | 'custom'
  usageCount: number
  lastUsed?: number
  createdAt: number
}

// ============================================================================
// DEFAULT MANTRAS
// ============================================================================

const DEFAULT_MANTRAS: Omit<Mantra, 'id' | 'usageCount' | 'createdAt'>[] = [
  { text: "I am the invariant. Change flows around me, not through me.", lamague: '⟟', category: 'identity' },
  { text: "Every microorcim fired is sovereignty reclaimed.", lamague: '⚡', category: 'action' },
  { text: "Drift is information. I notice, adjust, and continue.", lamague: '≋', category: 'mindset' },
  { text: "My boundaries are my power. I hold them without apology.", lamague: '∥◁▷∥', category: 'sovereignty' },
  { text: "I rise before conditions permit. Intent precedes circumstance.", lamague: 'Φ↑', category: 'action' },
  { text: "What I perceive clearly, I can navigate.", lamague: 'Ψ', category: 'mindset' },
  { text: "The cycle completes. I return stronger.", lamague: '⟲', category: 'sovereignty' },
  { text: "My light illuminates others without diminishing.", lamague: '✧', category: 'identity' },
]

// ============================================================================
// MANTRA CARD
// ============================================================================

function MantraCard({
  mantra,
  onUse,
  onDelete,
  featured = false
}: {
  mantra: Mantra
  onUse: () => void
  onDelete?: () => void
  featured?: boolean
}) {
  const categoryColors = {
    identity: 'purple',
    action: 'cyan',
    mindset: 'amber',
    sovereignty: 'emerald',
    custom: 'pink'
  }
  
  const color = categoryColors[mantra.category]
  
  return (
    <div className={`cascade-card p-5 ${featured ? 'bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-0.5 bg-${color}-500/20 text-${color}-400 text-xs rounded`}>
          {mantra.category}
        </span>
        <span className="text-2xl font-mono text-purple-400">{mantra.lamague}</span>
      </div>
      
      <p className={`text-zinc-200 ${featured ? 'text-xl' : 'text-base'} mb-4 leading-relaxed`}>
        "{mantra.text}"
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-600">Used {mantra.usageCount}×</span>
        <div className="flex gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-xs text-zinc-500 hover:text-red-400"
            >
              Delete
            </button>
          )}
          <button
            onClick={onUse}
            className={`px-4 py-1.5 bg-${color}-500/20 text-${color}-400 rounded text-sm hover:bg-${color}-500/30 transition-colors`}
          >
            Speak ✧
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function MantrasPage() {
  const [mantras, setMantras] = useState<Mantra[]>([])
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')
  const [category, setCategory] = useState<Mantra['category']>('custom')
  const [todaysMantra, setTodaysMantra] = useState<Mantra | null>(null)
  const [speaking, setSpeaking] = useState(false)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-mantras')
      if (saved) {
        setMantras(JSON.parse(saved))
      } else {
        // Initialize with defaults
        const defaults = DEFAULT_MANTRAS.map((m, i) => ({
          ...m,
          id: `mantra-default-${i}`,
          usageCount: 0,
          createdAt: Date.now()
        }))
        setMantras(defaults)
        localStorage.setItem('cascade-mantras', JSON.stringify(defaults))
      }
    }
  }, [])
  
  useEffect(() => {
    if (typeof window !== 'undefined' && mantras.length > 0) {
      localStorage.setItem('cascade-mantras', JSON.stringify(mantras))
    }
  }, [mantras])
  
  // Pick today's mantra
  useEffect(() => {
    if (mantras.length > 0 && !todaysMantra) {
      const today = new Date().toDateString()
      const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      const index = seed % mantras.length
      setTodaysMantra(mantras[index])
    }
  }, [mantras, todaysMantra])
  
  const addMantra = () => {
    if (!text.trim()) return
    
    const lamagues = ['⟟', '≋', 'Ψ', 'Φ↑', '✧', '∥◁▷∥', '⟲', '⚡']
    
    const mantra: Mantra = {
      id: `mantra-${Date.now()}`,
      text: text.trim(),
      lamague: lamagues[Math.floor(Math.random() * lamagues.length)],
      category,
      usageCount: 0,
      createdAt: Date.now()
    }
    
    setMantras(prev => [mantra, ...prev])
    setText('')
    setShowForm(false)
  }
  
  const useMantra = (id: string) => {
    setSpeaking(true)
    setMantras(prev => prev.map(m => 
      m.id === id ? { ...m, usageCount: m.usageCount + 1, lastUsed: Date.now() } : m
    ))
    
    // Visual feedback
    setTimeout(() => setSpeaking(false), 1500)
  }
  
  const deleteMantra = (id: string) => {
    setMantras(prev => prev.filter(m => m.id !== id))
  }
  
  const totalUses = mantras.reduce((sum, m) => sum + m.usageCount, 0)
  const mostUsed = [...mantras].sort((a, b) => b.usageCount - a.usageCount)[0]
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Mantras</h1>
            <p className="text-zinc-500">Power phrases for sovereignty and action</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-zinc-900 font-medium rounded-lg"
          >
            + New Mantra
          </button>
        </div>
      </header>
      
      {/* Speaking overlay */}
      {speaking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center animate-pulse">
            <span className="text-6xl font-mono text-purple-400">✧</span>
            <p className="text-xl text-zinc-300 mt-4">Speaking truth...</p>
          </div>
        </div>
      )}
      
      {/* Today's Mantra */}
      {todaysMantra && (
        <div className="mb-8">
          <h2 className="text-sm text-zinc-500 mb-3">Today's Mantra</h2>
          <MantraCard
            mantra={todaysMantra}
            onUse={() => useMantra(todaysMantra.id)}
            featured
          />
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{mantras.length}</p>
          <p className="text-xs text-zinc-500">Mantras</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{totalUses}</p>
          <p className="text-xs text-zinc-500">Total Uses</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{mostUsed?.usageCount || 0}</p>
          <p className="text-xs text-zinc-500">Most Used</p>
        </div>
      </div>
      
      {/* Add Form */}
      {showForm && (
        <div className="cascade-card p-6 mb-6">
          <h3 className="text-lg font-medium text-zinc-200 mb-4">New Mantra</h3>
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your mantra..."
              rows={2}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
            />
            
            <div>
              <label className="text-xs text-zinc-500 block mb-2">Category</label>
              <div className="flex gap-2">
                {(['identity', 'action', 'mindset', 'sovereignty', 'custom'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`flex-1 py-2 rounded text-sm ${
                      category === c
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {c}
                  </button>
                ))}
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
                onClick={addMantra}
                disabled={!text.trim()}
                className="flex-1 py-2 bg-purple-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
              >
                Add Mantra
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* All Mantras */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-zinc-200">All Mantras</h2>
        {mantras.filter(m => m.id !== todaysMantra?.id).map(mantra => (
          <MantraCard
            key={mantra.id}
            mantra={mantra}
            onUse={() => useMantra(mantra.id)}
            onDelete={mantra.id.includes('custom') || !mantra.id.includes('default') ? () => deleteMantra(mantra.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
