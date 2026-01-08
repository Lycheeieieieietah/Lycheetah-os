'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface DreamSymbol {
  symbol: string
  meaning: string
  frequency: number
  lamague?: string
}

interface DreamEntry {
  id: string
  title: string
  narrative: string
  emotions: string[]
  symbols: string[]
  clarity: number  // 1-5 how vivid
  lucid: boolean
  recurring: boolean
  interpretation?: string
  timestamp: number
  sleepQuality?: number
}

interface DreamPattern {
  type: 'symbol' | 'emotion' | 'theme'
  value: string
  count: number
  lastSeen: number
}

// ============================================================================
// DREAM SYMBOL DATABASE
// ============================================================================

const DREAM_SYMBOLS: Record<string, DreamSymbol> = {
  water: { symbol: '🌊', meaning: 'Emotions, unconscious, purification', frequency: 0, lamague: '≋' },
  flying: { symbol: '🦅', meaning: 'Freedom, transcendence, perspective', frequency: 0, lamague: 'Φ↑' },
  falling: { symbol: '⬇️', meaning: 'Loss of control, anxiety, letting go', frequency: 0, lamague: '▽' },
  teeth: { symbol: '🦷', meaning: 'Anxiety, transition, self-image', frequency: 0 },
  house: { symbol: '🏠', meaning: 'Self, psyche, different aspects of mind', frequency: 0, lamague: '⟟' },
  death: { symbol: '💀', meaning: 'Transformation, ending, new beginning', frequency: 0, lamague: '⟲' },
  snake: { symbol: '🐍', meaning: 'Transformation, healing, hidden knowledge', frequency: 0, lamague: 'Ψ' },
  fire: { symbol: '🔥', meaning: 'Passion, destruction, purification', frequency: 0, lamague: '∇cas' },
  chase: { symbol: '🏃', meaning: 'Avoidance, anxiety, confrontation needed', frequency: 0 },
  mirror: { symbol: '🪞', meaning: 'Self-reflection, truth, shadow aspects', frequency: 0, lamague: 'Ψ' },
  door: { symbol: '🚪', meaning: 'Opportunity, transition, new phase', frequency: 0, lamague: 'Φ↑' },
  light: { symbol: '💡', meaning: 'Insight, awareness, understanding', frequency: 0, lamague: '✧' },
  darkness: { symbol: '🌑', meaning: 'Unknown, shadow, unconscious', frequency: 0, lamague: '∅' },
  animal: { symbol: '🐾', meaning: 'Instincts, nature, primal self', frequency: 0 },
  child: { symbol: '👶', meaning: 'Inner child, innocence, new beginnings', frequency: 0, lamague: 'Ao' }
}

const EMOTIONS = [
  'peaceful', 'anxious', 'joyful', 'fearful', 'confused',
  'empowered', 'lost', 'loved', 'angry', 'curious',
  'nostalgic', 'hopeful', 'trapped', 'free', 'connected'
]

// ============================================================================
// DREAM ENTRY FORM
// ============================================================================

function DreamEntryForm({ onSave }: { onSave: (entry: Omit<DreamEntry, 'id' | 'timestamp'>) => void }) {
  const [title, setTitle] = useState('')
  const [narrative, setNarrative] = useState('')
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([])
  const [clarity, setClarity] = useState(3)
  const [lucid, setLucid] = useState(false)
  const [recurring, setRecurring] = useState(false)
  
  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    )
  }
  
  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }
  
  const handleSubmit = () => {
    if (!title.trim() || !narrative.trim()) return
    
    onSave({
      title,
      narrative,
      emotions: selectedEmotions,
      symbols: selectedSymbols,
      clarity,
      lucid,
      recurring
    })
    
    // Reset
    setTitle('')
    setNarrative('')
    setSelectedEmotions([])
    setSelectedSymbols([])
    setClarity(3)
    setLucid(false)
    setRecurring(false)
  }
  
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Dream Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this dream a name..."
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
        />
      </div>
      
      {/* Narrative */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Dream Narrative</label>
        <textarea
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          placeholder="Describe everything you remember..."
          rows={6}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
        />
      </div>
      
      {/* Clarity */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Dream Clarity (1-5)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level}
              onClick={() => setClarity(level)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                clarity >= level 
                  ? 'bg-purple-500/30 text-purple-300' 
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {'✧'.repeat(level)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Emotions */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Emotions Felt</label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map(emotion => (
            <button
              key={emotion}
              onClick={() => toggleEmotion(emotion)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedEmotions.includes(emotion)
                  ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
                  : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
              }`}
            >
              {emotion}
            </button>
          ))}
        </div>
      </div>
      
      {/* Symbols */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Dream Symbols</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DREAM_SYMBOLS).map(([key, sym]) => (
            <button
              key={key}
              onClick={() => toggleSymbol(key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                selectedSymbols.includes(key)
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
              }`}
            >
              <span>{sym.symbol}</span>
              <span>{key}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Flags */}
      <div className="flex gap-4">
        <button
          onClick={() => setLucid(!lucid)}
          className={`flex-1 py-3 rounded-lg transition-colors ${
            lucid 
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' 
              : 'bg-zinc-800 text-zinc-500'
          }`}
        >
          🌟 Lucid Dream
        </button>
        <button
          onClick={() => setRecurring(!recurring)}
          className={`flex-1 py-3 rounded-lg transition-colors ${
            recurring 
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' 
              : 'bg-zinc-800 text-zinc-500'
          }`}
        >
          🔄 Recurring Theme
        </button>
      </div>
      
      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!title.trim() || !narrative.trim()}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg disabled:opacity-50"
      >
        Record Dream
      </button>
    </div>
  )
}

// ============================================================================
// DREAM CARD
// ============================================================================

function DreamCard({ dream }: { dream: DreamEntry }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="cascade-card p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-zinc-200">{dream.title}</h3>
          <p className="text-xs text-zinc-500">
            {new Date(dream.timestamp).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dream.lucid && <span className="text-emerald-400" title="Lucid">🌟</span>}
          {dream.recurring && <span className="text-amber-400" title="Recurring">🔄</span>}
          <span className="text-purple-400 text-sm">{'✧'.repeat(dream.clarity)}</span>
        </div>
      </div>
      
      <p className={`text-sm text-zinc-400 ${expanded ? '' : 'line-clamp-2'}`}>
        {dream.narrative}
      </p>
      
      {dream.narrative.length > 150 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-cyan-400 mt-1"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
      
      {/* Symbols */}
      {dream.symbols.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {dream.symbols.map(sym => (
            <span key={sym} className="text-lg" title={DREAM_SYMBOLS[sym]?.meaning}>
              {DREAM_SYMBOLS[sym]?.symbol || sym}
            </span>
          ))}
        </div>
      )}
      
      {/* Emotions */}
      {dream.emotions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {dream.emotions.map(emotion => (
            <span key={emotion} className="px-2 py-0.5 bg-pink-500/10 text-pink-400 text-xs rounded">
              {emotion}
            </span>
          ))}
        </div>
      )}
      
      {/* AI Interpretation */}
      {dream.interpretation && (
        <div className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-xs text-purple-400 mb-1">AI Interpretation</p>
          <p className="text-sm text-zinc-300">{dream.interpretation}</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function DreamsPage() {
  const [dreams, setDreams] = useState<DreamEntry[]>([])
  const [patterns, setPatterns] = useState<DreamPattern[]>([])
  const [showForm, setShowForm] = useState(false)
  
  // Load dreams
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-dreams')
      if (saved) {
        const parsed = JSON.parse(saved)
        setDreams(parsed)
        calculatePatterns(parsed)
      }
    }
  }, [])
  
  const calculatePatterns = (dreamList: DreamEntry[]) => {
    const symbolCounts: Record<string, number> = {}
    const emotionCounts: Record<string, number> = {}
    
    dreamList.forEach(dream => {
      dream.symbols.forEach(sym => {
        symbolCounts[sym] = (symbolCounts[sym] || 0) + 1
      })
      dream.emotions.forEach(emo => {
        emotionCounts[emo] = (emotionCounts[emo] || 0) + 1
      })
    })
    
    const newPatterns: DreamPattern[] = [
      ...Object.entries(symbolCounts).map(([value, count]) => ({
        type: 'symbol' as const,
        value,
        count,
        lastSeen: dreamList.find(d => d.symbols.includes(value))?.timestamp || 0
      })),
      ...Object.entries(emotionCounts).map(([value, count]) => ({
        type: 'emotion' as const,
        value,
        count,
        lastSeen: dreamList.find(d => d.emotions.includes(value))?.timestamp || 0
      }))
    ].sort((a, b) => b.count - a.count)
    
    setPatterns(newPatterns)
  }
  
  const saveDream = (entry: Omit<DreamEntry, 'id' | 'timestamp'>) => {
    // Generate simple interpretation based on symbols
    let interpretation = ''
    if (entry.symbols.length > 0) {
      const meanings = entry.symbols
        .map(s => DREAM_SYMBOLS[s]?.meaning)
        .filter(Boolean)
        .slice(0, 3)
      interpretation = `Key themes: ${meanings.join('. ')}. Consider how these symbols relate to your current life circumstances.`
    }
    
    const newDream: DreamEntry = {
      ...entry,
      id: `dream-${Date.now()}`,
      timestamp: Date.now(),
      interpretation
    }
    
    const updated = [newDream, ...dreams]
    setDreams(updated)
    localStorage.setItem('cascade-dreams', JSON.stringify(updated))
    calculatePatterns(updated)
    setShowForm(false)
  }
  
  // Stats
  const totalDreams = dreams.length
  const lucidCount = dreams.filter(d => d.lucid).length
  const avgClarity = dreams.length > 0 
    ? (dreams.reduce((sum, d) => sum + d.clarity, 0) / dreams.length).toFixed(1)
    : 0
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Dream Journal</h1>
        <p className="text-zinc-500">Explore your unconscious mind</p>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{totalDreams}</p>
          <p className="text-xs text-zinc-500">Dreams Recorded</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{lucidCount}</p>
          <p className="text-xs text-zinc-500">Lucid Dreams</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{avgClarity}</p>
          <p className="text-xs text-zinc-500">Avg Clarity</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dreams List / Form */}
        <div className="lg:col-span-2">
          {showForm ? (
            <div className="cascade-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-zinc-200">New Dream Entry</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              </div>
              <DreamEntryForm onSave={saveDream} />
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="w-full mb-6 py-4 cascade-card text-center text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
              >
                + Record New Dream
              </button>
              
              {dreams.length === 0 ? (
                <div className="cascade-card p-12 text-center">
                  <p className="text-4xl mb-4">🌙</p>
                  <p className="text-zinc-400">No dreams recorded yet</p>
                  <p className="text-sm text-zinc-600">Start capturing your dream world</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dreams.map(dream => (
                    <DreamCard key={dream.id} dream={dream} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Patterns Sidebar */}
        <div className="space-y-6">
          {/* Top Symbols */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Recurring Symbols</h3>
            {patterns.filter(p => p.type === 'symbol').slice(0, 5).length === 0 ? (
              <p className="text-sm text-zinc-500">No patterns yet</p>
            ) : (
              <div className="space-y-2">
                {patterns.filter(p => p.type === 'symbol').slice(0, 5).map(pattern => (
                  <div key={pattern.value} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{DREAM_SYMBOLS[pattern.value]?.symbol}</span>
                      <span className="text-sm text-zinc-300">{pattern.value}</span>
                    </div>
                    <span className="text-sm text-cyan-400">{pattern.count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Top Emotions */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Common Emotions</h3>
            {patterns.filter(p => p.type === 'emotion').slice(0, 5).length === 0 ? (
              <p className="text-sm text-zinc-500">No patterns yet</p>
            ) : (
              <div className="space-y-2">
                {patterns.filter(p => p.type === 'emotion').slice(0, 5).map(pattern => (
                  <div key={pattern.value} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded">
                    <span className="text-sm text-zinc-300">{pattern.value}</span>
                    <span className="text-sm text-pink-400">{pattern.count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Symbol Guide */}
          <div className="cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Symbol Guide</h3>
            <div className="space-y-2 text-sm">
              <p className="text-zinc-500">
                Dreams speak in symbols. Common archetypes carry meaning across cultures.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {Object.entries(DREAM_SYMBOLS).slice(0, 6).map(([key, sym]) => (
                  <div key={key} className="text-center p-2" title={sym.meaning}>
                    <span className="text-2xl block">{sym.symbol}</span>
                    <span className="text-xs text-zinc-500">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
