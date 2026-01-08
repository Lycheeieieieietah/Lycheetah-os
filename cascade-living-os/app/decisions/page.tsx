'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

type DecisionStatus = 'pending' | 'made' | 'reviewed'
type DecisionOutcome = 'positive' | 'negative' | 'neutral' | 'unknown'

interface Decision {
  id: string
  title: string
  context: string
  options: string[]
  chosenOption: number | null
  reasoning: string
  status: DecisionStatus
  outcome?: DecisionOutcome
  outcomeNote?: string
  lamague: string
  createdAt: number
  decidedAt?: number
  reviewedAt?: number
  reviewAfter?: number // timestamp when to review
}

// ============================================================================
// DECISION CARD
// ============================================================================

function DecisionCard({
  decision,
  onUpdate
}: {
  decision: Decision
  onUpdate: (updates: Partial<Decision>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [reasoning, setReasoning] = useState(decision.reasoning)
  const [outcomeNote, setOutcomeNote] = useState(decision.outcomeNote || '')
  
  const statusColors = {
    pending: 'amber',
    made: 'cyan',
    reviewed: 'emerald'
  }
  
  const outcomeColors = {
    positive: 'emerald',
    negative: 'red',
    neutral: 'zinc',
    unknown: 'purple'
  }
  
  const needsReview = decision.status === 'made' && 
    decision.reviewAfter && 
    Date.now() > decision.reviewAfter
  
  return (
    <div className={`cascade-card p-5 ${needsReview ? 'border-amber-500/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 bg-${statusColors[decision.status]}-500/20 text-${statusColors[decision.status]}-400 text-xs rounded`}>
            {decision.status}
          </span>
          {needsReview && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
              needs review
            </span>
          )}
          {decision.outcome && (
            <span className={`px-2 py-0.5 bg-${outcomeColors[decision.outcome]}-500/20 text-${outcomeColors[decision.outcome]}-400 text-xs rounded`}>
              {decision.outcome}
            </span>
          )}
        </div>
        <span className="font-mono text-purple-400">{decision.lamague}</span>
      </div>
      
      <h3 className="text-lg font-medium text-zinc-200 mb-2">{decision.title}</h3>
      <p className="text-sm text-zinc-500 mb-3">{decision.context}</p>
      
      {/* Options */}
      <div className="space-y-2 mb-3">
        {decision.options.map((opt, i) => (
          <div 
            key={i}
            className={`p-2 rounded text-sm ${
              decision.chosenOption === i
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-zinc-800/50 text-zinc-500'
            }`}
          >
            {decision.status === 'pending' ? (
              <button
                onClick={() => onUpdate({ chosenOption: i, status: 'made', decidedAt: Date.now() })}
                className="w-full text-left"
              >
                {opt}
              </button>
            ) : (
              <span>{decision.chosenOption === i ? '✓ ' : ''}{opt}</span>
            )}
          </div>
        ))}
      </div>
      
      {/* Expand for details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-zinc-500 hover:text-zinc-300"
      >
        {expanded ? '▲ Less' : '▼ More'}
      </button>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4">
          {/* Reasoning */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Reasoning</label>
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              onBlur={() => onUpdate({ reasoning })}
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 resize-none"
              placeholder="Why did you choose this?"
            />
          </div>
          
          {/* Review section (if made) */}
          {decision.status === 'made' && (
            <div>
              <label className="text-xs text-zinc-500 block mb-2">Outcome</label>
              <div className="flex gap-2 mb-2">
                {(['positive', 'negative', 'neutral', 'unknown'] as DecisionOutcome[]).map(o => (
                  <button
                    key={o}
                    onClick={() => onUpdate({ outcome: o, status: 'reviewed', reviewedAt: Date.now() })}
                    className={`flex-1 py-2 rounded text-xs transition-colors ${
                      decision.outcome === o
                        ? `bg-${outcomeColors[o]}-500/20 text-${outcomeColors[o]}-400`
                        : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              <textarea
                value={outcomeNote}
                onChange={(e) => setOutcomeNote(e.target.value)}
                onBlur={() => onUpdate({ outcomeNote })}
                rows={2}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 resize-none"
                placeholder="What happened? What did you learn?"
              />
            </div>
          )}
          
          {/* Timestamps */}
          <div className="text-xs text-zinc-600 space-y-1">
            <p>Created: {new Date(decision.createdAt).toLocaleDateString()}</p>
            {decision.decidedAt && <p>Decided: {new Date(decision.decidedAt).toLocaleDateString()}</p>}
            {decision.reviewedAt && <p>Reviewed: {new Date(decision.reviewedAt).toLocaleDateString()}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | DecisionStatus | 'needs-review'>('all')
  
  // Form state
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [reviewDays, setReviewDays] = useState(30)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-decisions')
      if (saved) setDecisions(JSON.parse(saved))
    }
  }, [])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cascade-decisions', JSON.stringify(decisions))
    }
  }, [decisions])
  
  const addDecision = () => {
    if (!title.trim() || options.filter(o => o.trim()).length < 2) return
    
    const lamagues = ['Ψ', '∥◁▷∥', 'Φ↑', '⟲']
    
    const decision: Decision = {
      id: `dec-${Date.now()}`,
      title: title.trim(),
      context: context.trim(),
      options: options.filter(o => o.trim()),
      chosenOption: null,
      reasoning: '',
      status: 'pending',
      lamague: lamagues[Math.floor(Math.random() * lamagues.length)],
      createdAt: Date.now(),
      reviewAfter: Date.now() + (reviewDays * 24 * 60 * 60 * 1000)
    }
    
    setDecisions(prev => [decision, ...prev])
    setTitle('')
    setContext('')
    setOptions(['', ''])
    setShowForm(false)
  }
  
  const updateDecision = (id: string, updates: Partial<Decision>) => {
    setDecisions(prev => prev.map(d => 
      d.id === id ? { ...d, ...updates } : d
    ))
  }
  
  // Filter
  const filtered = decisions.filter(d => {
    if (filter === 'all') return true
    if (filter === 'needs-review') {
      return d.status === 'made' && d.reviewAfter && Date.now() > d.reviewAfter
    }
    return d.status === filter
  })
  
  // Stats
  const pending = decisions.filter(d => d.status === 'pending').length
  const reviewed = decisions.filter(d => d.status === 'reviewed').length
  const needsReview = decisions.filter(d => 
    d.status === 'made' && d.reviewAfter && Date.now() > d.reviewAfter
  ).length
  const positiveOutcomes = decisions.filter(d => d.outcome === 'positive').length
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Decisions</h1>
            <p className="text-zinc-500">Track major decisions and learn from outcomes</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-zinc-900 font-medium rounded-lg"
          >
            + New Decision
          </button>
        </div>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{pending}</p>
          <p className="text-xs text-zinc-500">Pending</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{needsReview}</p>
          <p className="text-xs text-zinc-500">Needs Review</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{reviewed}</p>
          <p className="text-xs text-zinc-500">Reviewed</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {reviewed > 0 ? Math.round((positiveOutcomes / reviewed) * 100) : 0}%
          </p>
          <p className="text-xs text-zinc-500">Positive</p>
        </div>
      </div>
      
      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'made', 'needs-review', 'reviewed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            {f === 'needs-review' ? 'Needs Review' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'needs-review' && needsReview > 0 && ` (${needsReview})`}
          </button>
        ))}
      </div>
      
      {/* New Decision Form */}
      {showForm && (
        <div className="cascade-card p-6 mb-6">
          <h3 className="text-lg font-medium text-zinc-200 mb-4">New Decision</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Decision title"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
            />
            
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Context: What's the situation?"
              rows={2}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
            />
            
            <div>
              <label className="text-xs text-zinc-500 block mb-2">Options</label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options]
                      newOpts[i] = e.target.value
                      setOptions(newOpts)
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => setOptions(options.filter((_, j) => j !== i))}
                      className="px-2 text-zinc-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setOptions([...options, ''])}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                + Add option
              </button>
            </div>
            
            <div>
              <label className="text-xs text-zinc-500 block mb-2">Review after (days)</label>
              <div className="flex gap-2">
                {[7, 14, 30, 60, 90].map(days => (
                  <button
                    key={days}
                    onClick={() => setReviewDays(days)}
                    className={`flex-1 py-2 rounded text-sm ${
                      reviewDays === days
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {days}d
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
                onClick={addDecision}
                disabled={!title.trim() || options.filter(o => o.trim()).length < 2}
                className="flex-1 py-2 bg-purple-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
              >
                Create Decision
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Decisions List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="cascade-card p-8 text-center">
            <p className="text-zinc-500">No decisions found</p>
          </div>
        ) : (
          filtered.map(d => (
            <DecisionCard
              key={d.id}
              decision={d}
              onUpdate={(updates) => updateDecision(d.id, updates)}
            />
          ))
        )}
      </div>
      
      {/* Philosophy */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-amber-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">Ψ Decision Wisdom</h3>
        <p className="text-sm text-zinc-400">
          Good decisions come from reviewing past decisions. By tracking choices and their 
          outcomes, you build decision-making skill over time. The goal isn't to be right 
          every time — it's to learn from every choice and improve your judgment.
        </p>
      </div>
    </div>
  )
}
