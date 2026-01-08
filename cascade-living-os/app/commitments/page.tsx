'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

type CommitmentStatus = 'active' | 'kept' | 'broken' | 'renegotiated'

interface Commitment {
  id: string
  to: string // Who is this commitment to? (self, person, org)
  content: string
  deadline?: number
  status: CommitmentStatus
  createdAt: number
  resolvedAt?: number
  note?: string
  lamague: string
}

// ============================================================================
// COMMITMENT CARD
// ============================================================================

function CommitmentCard({
  commitment,
  onUpdateStatus
}: {
  commitment: Commitment
  onUpdateStatus: (status: CommitmentStatus, note?: string) => void
}) {
  const [showResolve, setShowResolve] = useState(false)
  const [note, setNote] = useState('')
  
  const isOverdue = commitment.deadline && commitment.deadline < Date.now() && commitment.status === 'active'
  
  const statusColors = {
    active: 'border-cyan-500/30 bg-cyan-500/5',
    kept: 'border-emerald-500/30 bg-emerald-500/5',
    broken: 'border-red-500/30 bg-red-500/5',
    renegotiated: 'border-amber-500/30 bg-amber-500/5'
  }
  
  const statusIcons = {
    active: '⏳',
    kept: '✓',
    broken: '✗',
    renegotiated: '↻'
  }
  
  return (
    <div className={`p-4 rounded-lg border ${statusColors[commitment.status]} ${isOverdue ? 'border-red-500/50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{statusIcons[commitment.status]}</span>
          <span className="text-sm text-zinc-400">To: {commitment.to}</span>
        </div>
        <span className="font-mono text-purple-400">{commitment.lamague}</span>
      </div>
      
      <p className="text-zinc-200 mb-2">{commitment.content}</p>
      
      {commitment.deadline && (
        <p className={`text-xs mb-2 ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>
          {isOverdue ? '⚠️ Overdue: ' : 'Due: '}
          {new Date(commitment.deadline).toLocaleDateString()}
        </p>
      )}
      
      {commitment.status === 'active' && !showResolve && (
        <button
          onClick={() => setShowResolve(true)}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          Resolve →
        </button>
      )}
      
      {showResolve && (
        <div className="mt-3 p-3 bg-zinc-800/50 rounded space-y-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { onUpdateStatus('kept', note); setShowResolve(false) }}
              className="flex-1 py-1.5 bg-emerald-500/20 text-emerald-400 rounded text-sm"
            >
              Kept ✓
            </button>
            <button
              onClick={() => { onUpdateStatus('broken', note); setShowResolve(false) }}
              className="flex-1 py-1.5 bg-red-500/20 text-red-400 rounded text-sm"
            >
              Broken ✗
            </button>
            <button
              onClick={() => { onUpdateStatus('renegotiated', note); setShowResolve(false) }}
              className="flex-1 py-1.5 bg-amber-500/20 text-amber-400 rounded text-sm"
            >
              Renegotiated ↻
            </button>
          </div>
        </div>
      )}
      
      {commitment.note && commitment.status !== 'active' && (
        <p className="text-xs text-zinc-500 mt-2 italic">"{commitment.note}"</p>
      )}
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function CommitmentsPage() {
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [to, setTo] = useState('')
  const [content, setContent] = useState('')
  const [deadline, setDeadline] = useState('')
  const [filter, setFilter] = useState<CommitmentStatus | 'all'>('active')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-commitments')
      if (saved) setCommitments(JSON.parse(saved))
    }
  }, [])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cascade-commitments', JSON.stringify(commitments))
    }
  }, [commitments])
  
  const addCommitment = () => {
    if (!content.trim()) return
    
    const commitment: Commitment = {
      id: `comm-${Date.now()}`,
      to: to.trim() || 'Self',
      content: content.trim(),
      deadline: deadline ? new Date(deadline).getTime() : undefined,
      status: 'active',
      createdAt: Date.now(),
      lamague: '∥◁▷∥'
    }
    
    setCommitments(prev => [commitment, ...prev])
    setTo('')
    setContent('')
    setDeadline('')
    setShowForm(false)
  }
  
  const updateStatus = (id: string, status: CommitmentStatus, note?: string) => {
    setCommitments(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status, resolvedAt: Date.now(), note: note || c.note }
        : c
    ))
  }
  
  const filtered = filter === 'all' ? commitments : commitments.filter(c => c.status === filter)
  
  // Stats
  const total = commitments.length
  const kept = commitments.filter(c => c.status === 'kept').length
  const broken = commitments.filter(c => c.status === 'broken').length
  const active = commitments.filter(c => c.status === 'active').length
  const keepRate = total > 0 ? (kept / (kept + broken)) * 100 : 0
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Commitments</h1>
            <p className="text-zinc-500">Promises you make and keep — the currency of trust</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium rounded-lg"
          >
            + New Commitment
          </button>
        </div>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{active}</p>
          <p className="text-xs text-zinc-500">Active</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{kept}</p>
          <p className="text-xs text-zinc-500">Kept</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{broken}</p>
          <p className="text-xs text-zinc-500">Broken</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{keepRate.toFixed(0)}%</p>
          <p className="text-xs text-zinc-500">Keep Rate</p>
        </div>
      </div>
      
      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'kept', 'broken', 'renegotiated'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === s ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      
      {/* New Commitment Form */}
      {showForm && (
        <div className="cascade-card p-6 mb-6">
          <h3 className="text-lg font-medium text-zinc-200 mb-4">Make a Commitment</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To whom? (Self, person, team...)"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are you committing to?"
              rows={2}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 bg-zinc-800 text-zinc-400 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addCommitment}
                disabled={!content.trim()}
                className="flex-1 py-2 bg-cyan-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
              >
                Commit
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Commitments List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="cascade-card p-8 text-center">
            <p className="text-zinc-500">No commitments in this category</p>
          </div>
        ) : (
          filtered.map(c => (
            <CommitmentCard
              key={c.id}
              commitment={c}
              onUpdateStatus={(status, note) => updateStatus(c.id, status, note)}
            />
          ))
        )}
      </div>
      
      {/* Philosophy */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">∥◁▷∥ Integrity</h3>
        <p className="text-sm text-zinc-400">
          Commitments are the atomic unit of trust. Every kept promise builds credibility — 
          with others and yourself. Every broken promise erodes it. Track them explicitly 
          to maintain <span className="text-purple-400">integrity (∥◁▷∥)</span>.
        </p>
      </div>
    </div>
  )
}
