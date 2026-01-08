'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

type ConnectionType = 'family' | 'friend' | 'mentor' | 'colleague' | 'partner' | 'other'

interface Connection {
  id: string
  name: string
  type: ConnectionType
  lamague: string
  notes: string
  lastContact: number
  contactFrequency: number // days
  interactions: Interaction[]
  strengths: string[]
  createdAt: number
}

interface Interaction {
  id: string
  timestamp: number
  type: 'call' | 'meet' | 'message' | 'gift' | 'support'
  note?: string
}

// ============================================================================
// CONNECTION CARD
// ============================================================================

function ConnectionCard({
  connection,
  onInteraction,
  onSelect
}: {
  connection: Connection
  onInteraction: (type: Interaction['type']) => void
  onSelect: () => void
}) {
  const daysSinceContact = Math.floor((Date.now() - connection.lastContact) / (1000 * 60 * 60 * 24))
  const isOverdue = daysSinceContact > connection.contactFrequency
  
  const typeColors: Record<ConnectionType, string> = {
    family: 'pink',
    friend: 'cyan',
    mentor: 'purple',
    colleague: 'amber',
    partner: 'red',
    other: 'zinc'
  }
  
  const color = typeColors[connection.type]
  
  const interactionIcons = {
    call: '📞',
    meet: '🤝',
    message: '💬',
    gift: '🎁',
    support: '💪'
  }
  
  return (
    <div 
      className={`cascade-card p-4 hover:border-${color}-500/30 transition-all cursor-pointer ${
        isOverdue ? 'border-amber-500/30' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-${color}-500/20 flex items-center justify-center`}>
            <span className="text-lg font-medium text-zinc-300">
              {connection.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-zinc-200">{connection.name}</h3>
            <p className={`text-xs text-${color}-400`}>{connection.type}</p>
          </div>
        </div>
        <span className="font-mono text-purple-400 text-sm">{connection.lamague}</span>
      </div>
      
      {/* Contact status */}
      <div className={`flex items-center gap-2 text-xs mb-3 ${isOverdue ? 'text-amber-400' : 'text-zinc-500'}`}>
        {isOverdue ? '⚠️' : '✓'} Last contact: {daysSinceContact === 0 ? 'Today' : `${daysSinceContact}d ago`}
        {isOverdue && <span className="text-amber-400">(overdue)</span>}
      </div>
      
      {/* Quick interactions */}
      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
        {(Object.keys(interactionIcons) as Interaction['type'][]).map(type => (
          <button
            key={type}
            onClick={() => onInteraction(type)}
            className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-center transition-colors"
            title={type}
          >
            {interactionIcons[type]}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// CONNECTION DETAIL
// ============================================================================

function ConnectionDetail({
  connection,
  onClose,
  onUpdate
}: {
  connection: Connection
  onClose: () => void
  onUpdate: (updates: Partial<Connection>) => void
}) {
  const [notes, setNotes] = useState(connection.notes)
  const [newStrength, setNewStrength] = useState('')
  
  return (
    <div className="cascade-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <span className="text-xl font-medium text-zinc-300">
              {connection.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-medium text-zinc-200">{connection.name}</h3>
            <p className="text-sm text-zinc-500">{connection.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Notes */}
      <div className="mb-4">
        <label className="text-xs text-zinc-500 block mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onUpdate({ notes })}
          rows={3}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 resize-none"
          placeholder="Notes about this person..."
        />
      </div>
      
      {/* Strengths */}
      <div className="mb-4">
        <label className="text-xs text-zinc-500 block mb-1">What they bring to my life</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {connection.strengths.map((s, i) => (
            <span 
              key={i}
              className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs cursor-pointer hover:bg-emerald-500/20"
              onClick={() => onUpdate({ strengths: connection.strengths.filter((_, j) => j !== i) })}
            >
              {s} ×
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newStrength}
            onChange={(e) => setNewStrength(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newStrength.trim()) {
                onUpdate({ strengths: [...connection.strengths, newStrength.trim()] })
                setNewStrength('')
              }
            }}
            placeholder="Add strength..."
            className="flex-1 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"
          />
        </div>
      </div>
      
      {/* Recent interactions */}
      <div>
        <label className="text-xs text-zinc-500 block mb-2">Recent Interactions</label>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {connection.interactions.slice(0, 10).map(i => (
            <div key={i.id} className="flex items-center gap-2 text-xs p-2 bg-zinc-800/50 rounded">
              <span>
                {i.type === 'call' ? '📞' : 
                 i.type === 'meet' ? '🤝' : 
                 i.type === 'message' ? '💬' : 
                 i.type === 'gift' ? '🎁' : '💪'}
              </span>
              <span className="text-zinc-400">{i.type}</span>
              <span className="text-zinc-600 ml-auto">
                {new Date(i.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Contact frequency */}
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <label className="text-xs text-zinc-500 block mb-2">Contact every</label>
        <div className="flex gap-2">
          {[7, 14, 30, 60, 90].map(days => (
            <button
              key={days}
              onClick={() => onUpdate({ contactFrequency: days })}
              className={`flex-1 py-2 rounded text-xs transition-colors ${
                connection.contactFrequency === days
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [filterType, setFilterType] = useState<ConnectionType | 'all' | 'overdue'>('all')
  
  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState<ConnectionType>('friend')
  const [frequency, setFrequency] = useState(30)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-connections')
      if (saved) setConnections(JSON.parse(saved))
    }
  }, [])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cascade-connections', JSON.stringify(connections))
    }
  }, [connections])
  
  const addConnection = () => {
    if (!name.trim()) return
    
    const lamagues = ['✧', '⟟', '≋', 'Ψ', 'Φ↑', '∥◁▷∥', '⟲']
    
    const connection: Connection = {
      id: `conn-${Date.now()}`,
      name: name.trim(),
      type,
      lamague: lamagues[Math.floor(Math.random() * lamagues.length)],
      notes: '',
      lastContact: Date.now(),
      contactFrequency: frequency,
      interactions: [],
      strengths: [],
      createdAt: Date.now()
    }
    
    setConnections(prev => [connection, ...prev])
    setName('')
    setType('friend')
    setShowForm(false)
  }
  
  const addInteraction = (connectionId: string, interactionType: Interaction['type']) => {
    const interaction: Interaction = {
      id: `int-${Date.now()}`,
      timestamp: Date.now(),
      type: interactionType
    }
    
    setConnections(prev => prev.map(c => 
      c.id === connectionId
        ? { ...c, lastContact: Date.now(), interactions: [interaction, ...c.interactions] }
        : c
    ))
  }
  
  const updateConnection = (id: string, updates: Partial<Connection>) => {
    setConnections(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ))
    if (selectedConnection?.id === id) {
      setSelectedConnection(prev => prev ? { ...prev, ...updates } : null)
    }
  }
  
  // Filter connections
  const filtered = connections.filter(c => {
    if (filterType === 'all') return true
    if (filterType === 'overdue') {
      const daysSince = Math.floor((Date.now() - c.lastContact) / (1000 * 60 * 60 * 24))
      return daysSince > c.contactFrequency
    }
    return c.type === filterType
  })
  
  const overdueCount = connections.filter(c => {
    const daysSince = Math.floor((Date.now() - c.lastContact) / (1000 * 60 * 60 * 24))
    return daysSince > c.contactFrequency
  }).length
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Connections</h1>
            <p className="text-zinc-500">Nurture the relationships that matter</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium rounded-lg"
          >
            + Add Person
          </button>
        </div>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{connections.length}</p>
          <p className="text-xs text-zinc-500">Connections</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{overdueCount}</p>
          <p className="text-xs text-zinc-500">Overdue</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {connections.reduce((sum, c) => sum + c.interactions.length, 0)}
          </p>
          <p className="text-xs text-zinc-500">Interactions</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {connections.filter(c => c.type === 'family' || c.type === 'partner').length}
          </p>
          <p className="text-xs text-zinc-500">Inner Circle</p>
        </div>
      </div>
      
      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(['all', 'overdue', 'family', 'friend', 'mentor', 'colleague', 'partner'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              filterType === f
                ? f === 'overdue' 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-cyan-500/20 text-cyan-400'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'overdue' && overdueCount > 0 && ` (${overdueCount})`}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connections List */}
        <div className="lg:col-span-2 space-y-4">
          {showForm && (
            <div className="cascade-card p-6">
              <h3 className="text-lg font-medium text-zinc-200 mb-4">Add Connection</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
                />
                <div className="grid grid-cols-3 gap-2">
                  {(['family', 'friend', 'mentor', 'colleague', 'partner', 'other'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`py-2 rounded text-sm transition-colors ${
                        type === t ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 bg-zinc-800 text-zinc-400 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addConnection}
                    disabled={!name.trim()}
                    className="flex-1 py-2 bg-cyan-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {filtered.length === 0 ? (
            <div className="cascade-card p-8 text-center">
              <p className="text-zinc-500">No connections found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(conn => (
                <ConnectionCard
                  key={conn.id}
                  connection={conn}
                  onInteraction={(type) => addInteraction(conn.id, type)}
                  onSelect={() => setSelectedConnection(conn)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div>
          {selectedConnection ? (
            <ConnectionDetail
              connection={selectedConnection}
              onClose={() => setSelectedConnection(null)}
              onUpdate={(updates) => updateConnection(selectedConnection.id, updates)}
            />
          ) : (
            <div className="cascade-card p-6 bg-gradient-to-br from-pink-500/5 to-cyan-500/5">
              <h3 className="text-lg font-medium text-zinc-200 mb-3">✧ Connection Philosophy</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Relationships are the infrastructure of a meaningful life. 
                Regular contact keeps connections alive. Neglected relationships 
                atrophy like unused muscles.
              </p>
              <div className="text-xs text-zinc-500 space-y-1">
                <p>• Track who matters</p>
                <p>• Set contact frequency</p>
                <p>• Log interactions</p>
                <p>• Notice patterns</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
