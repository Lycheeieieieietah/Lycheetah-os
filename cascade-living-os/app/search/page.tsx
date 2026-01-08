'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

// ============================================================================
// TYPES
// ============================================================================

interface SearchResult {
  id: string
  type: 'journal' | 'memory' | 'goal' | 'ritual' | 'value' | 'commitment' | 'connection' | 'decision' | 'projection' | 'capture'
  title: string
  content: string
  timestamp: number
  lamague?: string
  link: string
}

// ============================================================================
// RESULT CARD
// ============================================================================

function ResultCard({ result }: { result: SearchResult }) {
  const typeConfig: Record<string, { icon: string; color: string }> = {
    journal: { icon: '📝', color: 'amber' },
    memory: { icon: '🧠', color: 'purple' },
    goal: { icon: '🎯', color: 'emerald' },
    ritual: { icon: '🔄', color: 'cyan' },
    value: { icon: '💜', color: 'pink' },
    commitment: { icon: '✓', color: 'blue' },
    connection: { icon: '👥', color: 'rose' },
    decision: { icon: '❓', color: 'amber' },
    projection: { icon: '🔮', color: 'purple' },
    capture: { icon: '💭', color: 'zinc' }
  }
  
  const config = typeConfig[result.type] || { icon: '•', color: 'zinc' }
  
  return (
    <Link href={result.link}>
      <div className={`cascade-card p-4 hover:border-${config.color}-500/30 transition-all cursor-pointer`}>
        <div className="flex items-start gap-3">
          <span className="text-xl">{config.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 bg-${config.color}-500/20 text-${config.color}-400 text-xs rounded`}>
                {result.type}
              </span>
              {result.lamague && (
                <span className="font-mono text-purple-400 text-sm">{result.lamague}</span>
              )}
              <span className="text-xs text-zinc-600 ml-auto">
                {new Date(result.timestamp).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-medium text-zinc-200 mb-1 truncate">{result.title}</h3>
            <p className="text-sm text-zinc-500 line-clamp-2">{result.content}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [allData, setAllData] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  
  // Load all searchable data
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    setLoading(true)
    const results: SearchResult[] = []
    
    // Journal entries
    const journal = JSON.parse(localStorage.getItem('cascade-journal') || '[]')
    journal.forEach((j: any) => {
      results.push({
        id: j.id || `j-${j.timestamp}`,
        type: 'journal',
        title: j.title || new Date(j.timestamp).toLocaleDateString(),
        content: j.content || '',
        timestamp: j.timestamp,
        lamague: j.lamague,
        link: '/journal'
      })
    })
    
    // Memories
    const memories = JSON.parse(localStorage.getItem('cascade-memories') || '[]')
    memories.forEach((m: any) => {
      results.push({
        id: m.id,
        type: 'memory',
        title: m.content.substring(0, 50) + '...',
        content: m.content,
        timestamp: m.timestamp,
        lamague: m.lamague,
        link: '/memory'
      })
    })
    
    // Goals
    const goals = JSON.parse(localStorage.getItem('cascade-goals') || '[]')
    goals.forEach((g: any) => {
      results.push({
        id: g.id,
        type: 'goal',
        title: g.title,
        content: g.description + ' | Why: ' + g.why,
        timestamp: g.createdAt,
        lamague: g.lamague,
        link: '/goals'
      })
    })
    
    // Rituals
    const rituals = JSON.parse(localStorage.getItem('cascade-rituals') || '[]')
    rituals.forEach((r: any) => {
      results.push({
        id: r.id,
        type: 'ritual',
        title: r.name,
        content: r.description || '',
        timestamp: r.createdAt || Date.now(),
        lamague: r.lamague,
        link: '/rituals'
      })
    })
    
    // Values
    const values = JSON.parse(localStorage.getItem('cascade-values') || '[]')
    values.forEach((v: any) => {
      results.push({
        id: v.id,
        type: 'value',
        title: v.title,
        content: v.description + (v.examples ? ' | Examples: ' + v.examples.join(', ') : ''),
        timestamp: v.createdAt || Date.now(),
        lamague: v.lamague,
        link: '/values'
      })
    })
    
    // Commitments
    const commitments = JSON.parse(localStorage.getItem('cascade-commitments') || '[]')
    commitments.forEach((c: any) => {
      results.push({
        id: c.id,
        type: 'commitment',
        title: `To ${c.to}: ${c.content.substring(0, 40)}...`,
        content: c.content,
        timestamp: c.createdAt,
        lamague: c.lamague,
        link: '/commitments'
      })
    })
    
    // Connections
    const connections = JSON.parse(localStorage.getItem('cascade-connections') || '[]')
    connections.forEach((c: any) => {
      results.push({
        id: c.id,
        type: 'connection',
        title: c.name,
        content: `${c.type} | ${c.notes || 'No notes'}`,
        timestamp: c.createdAt,
        lamague: c.lamague,
        link: '/connections'
      })
    })
    
    // Decisions
    const decisions = JSON.parse(localStorage.getItem('cascade-decisions') || '[]')
    decisions.forEach((d: any) => {
      results.push({
        id: d.id,
        type: 'decision',
        title: d.title,
        content: d.context + ' | Options: ' + d.options.join(', '),
        timestamp: d.createdAt,
        lamague: d.lamague,
        link: '/decisions'
      })
    })
    
    // Projections
    const projections = JSON.parse(localStorage.getItem('cascade-projections') || '[]')
    projections.forEach((p: any) => {
      results.push({
        id: p.id,
        type: 'projection',
        title: p.title,
        content: p.description,
        timestamp: p.createdAt,
        lamague: p.lamague,
        link: '/projections'
      })
    })
    
    // Quick captures
    const captures = JSON.parse(localStorage.getItem('cascade-quick-captures') || '[]')
    captures.forEach((c: any) => {
      results.push({
        id: c.id,
        type: 'capture',
        title: c.type + ': ' + c.content.substring(0, 30) + '...',
        content: c.content,
        timestamp: c.timestamp,
        link: '/today'
      })
    })
    
    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp - a.timestamp)
    setAllData(results)
    setLoading(false)
  }, [])
  
  // Filter and search
  const results = useMemo(() => {
    let filtered = allData
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter)
    }
    
    // Search query
    if (query.trim()) {
      const q = query.toLowerCase()
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q) ||
        r.type.includes(q)
      )
    }
    
    return filtered.slice(0, 50) // Limit results
  }, [allData, query, typeFilter])
  
  const types = ['all', 'journal', 'memory', 'goal', 'ritual', 'value', 'commitment', 'connection', 'decision', 'projection', 'capture']
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Search</h1>
        <p className="text-zinc-500">Find anything across your CASCADE data</p>
      </header>
      
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search journals, memories, goals, values..."
            autoFocus
            className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-cyan-500 text-lg"
          />
        </div>
      </div>
      
      {/* Type Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
              typeFilter === t
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse h-24 bg-zinc-800 rounded-lg" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="cascade-card p-12 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-zinc-400 mb-2">No results found</p>
          <p className="text-xs text-zinc-600">
            {query ? `No matches for "${query}"` : 'Start typing to search'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500 mb-4">{results.length} results</p>
          {results.map(result => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      )}
      
      {/* Stats */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">Data Overview</h3>
        <div className="grid grid-cols-5 gap-4 text-center text-xs">
          {types.slice(1, 6).map(t => (
            <div key={t}>
              <p className="text-lg font-bold text-cyan-400">
                {allData.filter(d => d.type === t).length}
              </p>
              <p className="text-zinc-500">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
