'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface Synchronicity {
  id: string
  title: string
  description: string
  elements: SyncElement[]  // The connected pieces
  significance: number     // 1-10 how meaningful
  category: SyncCategory
  tags: string[]
  interpretation?: string
  timestamp: number
  linkedTo?: string[]      // IDs of related synchronicities
}

interface SyncElement {
  type: 'thought' | 'event' | 'symbol' | 'person' | 'number' | 'word' | 'dream' | 'other'
  content: string
  occurredAt?: number
}

type SyncCategory = 
  | 'number_pattern'
  | 'meaningful_coincidence'
  | 'symbolic_echo'
  | 'dream_manifestation'
  | 'thought_manifestation'
  | 'serendipitous_meeting'
  | 'information_cluster'
  | 'other'

interface SyncPattern {
  pattern: string
  count: number
  lastSeen: number
  syncs: string[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ELEMENT_ICONS: Record<SyncElement['type'], string> = {
  thought: '💭',
  event: '⚡',
  symbol: '🔮',
  person: '👤',
  number: '🔢',
  word: '📝',
  dream: '🌙',
  other: '✧'
}

const CATEGORY_INFO: Record<SyncCategory, { label: string; icon: string; color: string }> = {
  number_pattern: { label: 'Number Pattern', icon: '🔢', color: 'cyan' },
  meaningful_coincidence: { label: 'Meaningful Coincidence', icon: '🎯', color: 'purple' },
  symbolic_echo: { label: 'Symbolic Echo', icon: '🔮', color: 'pink' },
  dream_manifestation: { label: 'Dream Manifestation', icon: '🌙', color: 'indigo' },
  thought_manifestation: { label: 'Thought Manifestation', icon: '💭', color: 'amber' },
  serendipitous_meeting: { label: 'Serendipitous Meeting', icon: '👥', color: 'emerald' },
  information_cluster: { label: 'Information Cluster', icon: '📚', color: 'blue' },
  other: { label: 'Other', icon: '✧', color: 'zinc' }
}

// ============================================================================
// SYNC CARD
// ============================================================================

function SyncCard({ sync, onClick }: { sync: Synchronicity; onClick: () => void }) {
  const category = CATEGORY_INFO[sync.category]
  
  return (
    <div 
      className={`cascade-card p-4 cursor-pointer hover:border-${category.color}-500/30 transition-all`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <div>
            <h3 className="font-medium text-zinc-200">{sync.title}</h3>
            <p className="text-xs text-zinc-500">
              {new Date(sync.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(sync.significance, 5) }).map((_, i) => (
            <span key={i} className="text-amber-400 text-xs">✧</span>
          ))}
        </div>
      </div>
      
      <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{sync.description}</p>
      
      {/* Elements preview */}
      <div className="flex flex-wrap gap-1">
        {sync.elements.slice(0, 4).map((el, i) => (
          <span 
            key={i}
            className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400"
          >
            {ELEMENT_ICONS[el.type]} {el.content.slice(0, 20)}
          </span>
        ))}
        {sync.elements.length > 4 && (
          <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-500">
            +{sync.elements.length - 4} more
          </span>
        )}
      </div>
      
      {/* Tags */}
      {sync.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {sync.tags.slice(0, 3).map(tag => (
            <span key={tag} className={`px-2 py-0.5 bg-${category.color}-500/10 text-${category.color}-400 rounded text-xs`}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// CREATE SYNC FORM
// ============================================================================

function CreateSyncForm({ 
  onSave, 
  onCancel 
}: { 
  onSave: (sync: Omit<Synchronicity, 'id' | 'timestamp'>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<SyncCategory>('meaningful_coincidence')
  const [significance, setSignificance] = useState(5)
  const [elements, setElements] = useState<SyncElement[]>([
    { type: 'event', content: '' },
    { type: 'event', content: '' }
  ])
  const [tags, setTags] = useState('')
  const [interpretation, setInterpretation] = useState('')
  
  const addElement = () => {
    setElements([...elements, { type: 'event', content: '' }])
  }
  
  const updateElement = (index: number, updates: Partial<SyncElement>) => {
    const updated = [...elements]
    updated[index] = { ...updated[index], ...updates }
    setElements(updated)
  }
  
  const removeElement = (index: number) => {
    if (elements.length > 2) {
      setElements(elements.filter((_, i) => i !== index))
    }
  }
  
  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return
    
    onSave({
      title,
      description,
      category,
      significance,
      elements: elements.filter(e => e.content.trim()),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      interpretation: interpretation || undefined
    })
  }
  
  return (
    <div className="cascade-card p-6">
      <h2 className="text-xl font-bold text-zinc-100 mb-6">Log Synchronicity</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name this synchronicity..."
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">What happened?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the meaningful coincidence..."
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.entries(CATEGORY_INFO) as [SyncCategory, typeof CATEGORY_INFO[SyncCategory]][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`p-2 rounded-lg text-sm transition-all ${
                  category === key
                    ? `bg-${info.color}-500/20 border border-${info.color}-500/50 text-${info.color}-300`
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                <span className="text-lg block mb-1">{info.icon}</span>
                <span className="text-xs">{info.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Connected Elements</label>
          <div className="space-y-2">
            {elements.map((el, i) => (
              <div key={i} className="flex gap-2">
                <select
                  value={el.type}
                  onChange={(e) => updateElement(i, { type: e.target.value as SyncElement['type'] })}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm"
                >
                  {Object.entries(ELEMENT_ICONS).map(([type, icon]) => (
                    <option key={type} value={type}>{icon} {type}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={el.content}
                  onChange={(e) => updateElement(i, { content: e.target.value })}
                  placeholder={`Describe the ${el.type}...`}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm"
                />
                {elements.length > 2 && (
                  <button
                    onClick={() => removeElement(i)}
                    className="px-2 text-zinc-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addElement} className="mt-2 text-sm text-cyan-400">
            + Add Element
          </button>
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Significance (1-10)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={significance}
              onChange={(e) => setSignificance(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-bold text-amber-400 w-8">{significance}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>Interesting</span>
            <span>Life-changing</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="career, relationship, 1111, etc..."
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Your Interpretation (optional)</label>
          <textarea
            value={interpretation}
            onChange={(e) => setInterpretation(e.target.value)}
            placeholder="What do you think this means?"
            rows={2}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button onClick={onCancel} className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
          >
            Log Synchronicity
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function SynchronicityPage() {
  const [syncs, setSyncs] = useState<Synchronicity[]>([])
  const [patterns, setPatterns] = useState<SyncPattern[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [selectedSync, setSelectedSync] = useState<Synchronicity | null>(null)
  const [filterCategory, setFilterCategory] = useState<SyncCategory | 'all'>('all')
  
  // Load syncs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-synchronicities')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSyncs(parsed)
        analyzePatterns(parsed)
      }
    }
  }, [])
  
  const analyzePatterns = (syncList: Synchronicity[]) => {
    const tagCounts: Record<string, { count: number; lastSeen: number; syncs: string[] }> = {}
    
    syncList.forEach(sync => {
      sync.tags.forEach(tag => {
        if (!tagCounts[tag]) {
          tagCounts[tag] = { count: 0, lastSeen: 0, syncs: [] }
        }
        tagCounts[tag].count++
        tagCounts[tag].lastSeen = Math.max(tagCounts[tag].lastSeen, sync.timestamp)
        tagCounts[tag].syncs.push(sync.id)
      })
    })
    
    const newPatterns = Object.entries(tagCounts)
      .filter(([, data]) => data.count >= 2)
      .map(([pattern, data]) => ({
        pattern,
        count: data.count,
        lastSeen: data.lastSeen,
        syncs: data.syncs
      }))
      .sort((a, b) => b.count - a.count)
    
    setPatterns(newPatterns)
  }
  
  const saveSync = (sync: Omit<Synchronicity, 'id' | 'timestamp'>) => {
    const newSync: Synchronicity = {
      ...sync,
      id: `sync-${Date.now()}`,
      timestamp: Date.now()
    }
    
    const updated = [newSync, ...syncs]
    setSyncs(updated)
    localStorage.setItem('cascade-synchronicities', JSON.stringify(updated))
    analyzePatterns(updated)
    setShowCreate(false)
  }
  
  const filteredSyncs = filterCategory === 'all' 
    ? syncs 
    : syncs.filter(s => s.category === filterCategory)
  
  // Stats
  const avgSignificance = syncs.length > 0
    ? (syncs.reduce((sum, s) => sum + s.significance, 0) / syncs.length).toFixed(1)
    : 0
  const thisWeek = syncs.filter(s => 
    Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000
  ).length
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Synchronicity Tracker</h1>
        <p className="text-zinc-500">Log meaningful coincidences and emergent patterns</p>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{syncs.length}</p>
          <p className="text-xs text-zinc-500">Total Logged</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{thisWeek}</p>
          <p className="text-xs text-zinc-500">This Week</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{avgSignificance}</p>
          <p className="text-xs text-zinc-500">Avg Significance</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{patterns.length}</p>
          <p className="text-xs text-zinc-500">Patterns Found</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Area */}
        <div className="lg:col-span-2">
          {showCreate ? (
            <CreateSyncForm onSave={saveSync} onCancel={() => setShowCreate(false)} />
          ) : (
            <>
              <button
                onClick={() => setShowCreate(true)}
                className="w-full mb-6 py-4 cascade-card text-center text-zinc-400 hover:text-purple-400 hover:border-purple-500/30 transition-all"
              >
                + Log New Synchronicity
              </button>
              
              {/* Filter */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                    filterCategory === 'all'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  All
                </button>
                {(Object.entries(CATEGORY_INFO) as [SyncCategory, typeof CATEGORY_INFO[SyncCategory]][]).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setFilterCategory(key)}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                      filterCategory === key
                        ? `bg-${info.color}-500/20 text-${info.color}-400`
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {info.icon} {info.label}
                  </button>
                ))}
              </div>
              
              {filteredSyncs.length === 0 ? (
                <div className="cascade-card p-12 text-center">
                  <p className="text-4xl mb-4">✧</p>
                  <p className="text-zinc-400">No synchronicities logged yet</p>
                  <p className="text-sm text-zinc-600">Start noticing the meaningful coincidences</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSyncs.map(sync => (
                    <SyncCard 
                      key={sync.id} 
                      sync={sync}
                      onClick={() => setSelectedSync(sync)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emerging Patterns */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">🔮 Emerging Patterns</h3>
            {patterns.length === 0 ? (
              <p className="text-sm text-zinc-500">Patterns emerge with more data</p>
            ) : (
              <div className="space-y-2">
                {patterns.slice(0, 8).map(pattern => (
                  <div key={pattern.pattern} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded">
                    <span className="text-sm text-zinc-300">#{pattern.pattern}</span>
                    <span className="text-sm text-purple-400">{pattern.count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Recent High Significance */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">⚡ High Significance</h3>
            {syncs.filter(s => s.significance >= 7).length === 0 ? (
              <p className="text-sm text-zinc-500">No high-significance events yet</p>
            ) : (
              <div className="space-y-2">
                {syncs
                  .filter(s => s.significance >= 7)
                  .slice(0, 5)
                  .map(sync => (
                    <div key={sync.id} className="p-2 bg-amber-500/10 rounded">
                      <p className="text-sm text-zinc-300">{sync.title}</p>
                      <p className="text-xs text-amber-400">
                        {'✧'.repeat(sync.significance)}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          {/* Philosophy */}
          <div className="cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
            <h3 className="text-lg font-medium text-zinc-200 mb-3">✧ On Synchronicity</h3>
            <p className="text-sm text-zinc-400 mb-3">
              "Synchronicity is an ever present reality for those who have eyes to see." — Carl Jung
            </p>
            <p className="text-sm text-zinc-500">
              Meaningful coincidences are the universe's way of winking at you. By tracking them, 
              you train your attention to notice the subtle threads connecting events, thoughts, 
              and encounters. Patterns emerge. Reality responds to observation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
