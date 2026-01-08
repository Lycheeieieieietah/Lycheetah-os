'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface LifeScript {
  id: string
  original: string         // The limiting belief/story
  rewritten: string        // The new empowering version
  category: ScriptCategory
  origin?: string          // Where this came from
  evidence: {
    supporting: string[]   // Evidence for original
    contradicting: string[] // Evidence against original
  }
  strength: number         // 1-10 how strongly held
  newStrength: number      // 1-10 strength of rewrite
  triggers: string[]
  affirmations: string[]
  status: 'identified' | 'questioning' | 'rewriting' | 'integrated'
  practiceCount: number
  lastPracticed?: number
  createdAt: number
}

type ScriptCategory = 
  | 'self_worth'
  | 'capability'
  | 'relationships'
  | 'money'
  | 'success'
  | 'health'
  | 'creativity'
  | 'safety'
  | 'belonging'
  | 'other'

interface ScriptPractice {
  id: string
  scriptId: string
  type: 'affirmation' | 'evidence_hunt' | 'reframe' | 'visualization'
  notes?: string
  beforeStrength: number
  afterStrength: number
  timestamp: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_INFO: Record<ScriptCategory, { label: string; icon: string; color: string }> = {
  self_worth: { label: 'Self Worth', icon: '💎', color: 'purple' },
  capability: { label: 'Capability', icon: '🎯', color: 'cyan' },
  relationships: { label: 'Relationships', icon: '💗', color: 'pink' },
  money: { label: 'Money/Abundance', icon: '💰', color: 'amber' },
  success: { label: 'Success', icon: '🏆', color: 'emerald' },
  health: { label: 'Health', icon: '🌿', color: 'green' },
  creativity: { label: 'Creativity', icon: '🎨', color: 'orange' },
  safety: { label: 'Safety/Trust', icon: '🛡️', color: 'blue' },
  belonging: { label: 'Belonging', icon: '🏠', color: 'indigo' },
  other: { label: 'Other', icon: '✧', color: 'zinc' }
}

const COMMON_SCRIPTS = [
  { original: "I'm not good enough", category: 'self_worth' as ScriptCategory },
  { original: "I don't deserve success", category: 'success' as ScriptCategory },
  { original: "Money is hard to come by", category: 'money' as ScriptCategory },
  { original: "I'm not creative", category: 'creativity' as ScriptCategory },
  { original: "People will leave me", category: 'relationships' as ScriptCategory },
  { original: "I can't trust anyone", category: 'safety' as ScriptCategory },
  { original: "I don't belong here", category: 'belonging' as ScriptCategory },
  { original: "My body is weak", category: 'health' as ScriptCategory }
]

const INQUIRY_QUESTIONS = [
  "Is this thought absolutely true?",
  "Can you be certain this is true?",
  "How do you react when you believe this thought?",
  "Who would you be without this thought?",
  "What evidence contradicts this belief?",
  "When did you first learn this story?",
  "Whose voice is this originally?"
]

// ============================================================================
// SCRIPT CARD
// ============================================================================

function ScriptCard({ 
  script, 
  onSelect 
}: { 
  script: LifeScript
  onSelect: () => void
}) {
  const category = CATEGORY_INFO[script.category]
  const progress = Math.round(
    ((10 - script.strength) + script.newStrength) / 2 * 10
  )
  
  return (
    <div 
      className={`cascade-card p-5 cursor-pointer hover:border-${category.color}-500/30 transition-all`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{category.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-0.5 rounded-full bg-${category.color}-500/20 text-${category.color}-400`}>
              {category.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              script.status === 'integrated' ? 'bg-emerald-500/20 text-emerald-400' :
              script.status === 'rewriting' ? 'bg-cyan-500/20 text-cyan-400' :
              script.status === 'questioning' ? 'bg-amber-500/20 text-amber-400' :
              'bg-zinc-800 text-zinc-500'
            }`}>
              {script.status}
            </span>
          </div>
        </div>
      </div>
      
      {/* Original Script */}
      <div className="mb-3">
        <p className="text-xs text-red-400 mb-1">Old Story:</p>
        <p className="text-sm text-zinc-400 line-through italic">"{script.original}"</p>
      </div>
      
      {/* Rewritten Script */}
      {script.rewritten && (
        <div className="mb-3">
          <p className="text-xs text-emerald-400 mb-1">New Story:</p>
          <p className="text-sm text-zinc-200">"{script.rewritten}"</p>
        </div>
      )}
      
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-zinc-500">Integration</span>
          <span className="text-cyan-400">{progress}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Practice count */}
      <p className="text-xs text-zinc-600 mt-2">
        {script.practiceCount} practice sessions
      </p>
    </div>
  )
}

// ============================================================================
// SCRIPT DETAIL VIEW
// ============================================================================

function ScriptDetailView({ 
  script, 
  onUpdate, 
  onClose 
}: { 
  script: LifeScript
  onUpdate: (updated: LifeScript) => void
  onClose: () => void
}) {
  const [editMode, setEditMode] = useState(false)
  const [rewritten, setRewritten] = useState(script.rewritten)
  const [newEvidence, setNewEvidence] = useState('')
  const [inquiryIndex, setInquiryIndex] = useState(0)
  
  const category = CATEGORY_INFO[script.category]
  
  const addEvidence = (type: 'supporting' | 'contradicting') => {
    if (!newEvidence.trim()) return
    
    const updated = {
      ...script,
      evidence: {
        ...script.evidence,
        [type]: [...script.evidence[type], newEvidence]
      }
    }
    onUpdate(updated)
    setNewEvidence('')
  }
  
  const saveRewrite = () => {
    const updated = {
      ...script,
      rewritten,
      status: 'rewriting' as const,
      newStrength: Math.max(script.newStrength, 3)
    }
    onUpdate(updated)
    setEditMode(false)
  }
  
  const practice = (type: 'affirmation' | 'visualization') => {
    const updated = {
      ...script,
      practiceCount: script.practiceCount + 1,
      lastPracticed: Date.now(),
      strength: Math.max(1, script.strength - 0.2),
      newStrength: Math.min(10, script.newStrength + 0.3)
    }
    onUpdate(updated)
  }
  
  const markIntegrated = () => {
    const updated = {
      ...script,
      status: 'integrated' as const,
      strength: 2,
      newStrength: 9
    }
    onUpdate(updated)
  }
  
  return (
    <div className="cascade-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-${category.color}-500/20 text-${category.color}-400`}>
              {category.label}
            </span>
            <p className="text-sm text-zinc-500 mt-1">Life Script</p>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">✕</button>
      </div>
      
      {/* Original Script */}
      <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg mb-4">
        <p className="text-xs text-red-400 mb-2">🔒 Old Limiting Script</p>
        <p className="text-lg text-zinc-300 italic">"{script.original}"</p>
        {script.origin && (
          <p className="text-xs text-zinc-500 mt-2">Origin: {script.origin}</p>
        )}
      </div>
      
      {/* Rewritten Script */}
      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg mb-6">
        <p className="text-xs text-emerald-400 mb-2">✧ New Empowering Script</p>
        {editMode ? (
          <div>
            <textarea
              value={rewritten}
              onChange={(e) => setRewritten(e.target.value)}
              placeholder="Write your new empowering belief..."
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none mb-2"
            />
            <div className="flex gap-2">
              <button onClick={() => setEditMode(false)} className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded text-sm">
                Cancel
              </button>
              <button onClick={saveRewrite} className="px-3 py-1 bg-emerald-500 text-white rounded text-sm">
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-lg text-zinc-200">
              {script.rewritten || "Click to write your new story..."}
            </p>
            <button 
              onClick={() => setEditMode(true)}
              className="text-xs text-emerald-400 mt-2"
            >
              Edit rewrite →
            </button>
          </div>
        )}
      </div>
      
      {/* Strength Meters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-400">Old Script Strength</span>
            <span className="text-zinc-400">{script.strength}/10</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all"
              style={{ width: `${script.strength * 10}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-emerald-400">New Script Strength</span>
            <span className="text-zinc-400">{script.newStrength.toFixed(1)}/10</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${script.newStrength * 10}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Inquiry Section */}
      <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-lg mb-6">
        <p className="text-xs text-purple-400 mb-2">🔍 Inquiry Question</p>
        <p className="text-zinc-200 mb-3 italic">"{INQUIRY_QUESTIONS[inquiryIndex]}"</p>
        <button 
          onClick={() => setInquiryIndex((inquiryIndex + 1) % INQUIRY_QUESTIONS.length)}
          className="text-xs text-purple-400"
        >
          Next question →
        </button>
      </div>
      
      {/* Evidence */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-red-400 mb-2">Evidence Supporting Old Script</p>
          <div className="space-y-1 mb-2">
            {script.evidence.supporting.map((e, i) => (
              <p key={i} className="text-xs text-zinc-500 p-2 bg-zinc-800/50 rounded">• {e}</p>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newEvidence}
              onChange={(e) => setNewEvidence(e.target.value)}
              placeholder="Add evidence..."
              className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200"
            />
            <button 
              onClick={() => addEvidence('supporting')}
              className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs text-emerald-400 mb-2">Evidence Against Old Script</p>
          <div className="space-y-1 mb-2">
            {script.evidence.contradicting.map((e, i) => (
              <p key={i} className="text-xs text-zinc-400 p-2 bg-emerald-500/5 rounded">• {e}</p>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newEvidence}
              onChange={(e) => setNewEvidence(e.target.value)}
              placeholder="Add counter-evidence..."
              className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200"
            />
            <button 
              onClick={() => addEvidence('contradicting')}
              className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {/* Practice Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => practice('affirmation')}
          className="flex-1 py-3 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm"
        >
          🗣️ Speak Affirmation
        </button>
        <button
          onClick={() => practice('visualization')}
          className="flex-1 py-3 bg-purple-500/20 text-purple-400 rounded-lg text-sm"
        >
          ✧ Visualize New Story
        </button>
        {script.status !== 'integrated' && script.newStrength >= 7 && (
          <button
            onClick={markIntegrated}
            className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm"
          >
            ✓ Mark Integrated
          </button>
        )}
      </div>
      
      <p className="text-xs text-zinc-600 text-center mt-4">
        {script.practiceCount} practice sessions • Last: {script.lastPracticed 
          ? new Date(script.lastPracticed).toLocaleDateString() 
          : 'Never'}
      </p>
    </div>
  )
}

// ============================================================================
// CREATE SCRIPT FORM
// ============================================================================

function CreateScriptForm({ 
  onSave, 
  onCancel 
}: { 
  onSave: (script: Omit<LifeScript, 'id' | 'createdAt'>) => void
  onCancel: () => void
}) {
  const [original, setOriginal] = useState('')
  const [rewritten, setRewritten] = useState('')
  const [category, setCategory] = useState<ScriptCategory>('self_worth')
  const [origin, setOrigin] = useState('')
  const [strength, setStrength] = useState(7)
  
  const handleSubmit = () => {
    if (!original.trim()) return
    
    onSave({
      original,
      rewritten,
      category,
      origin: origin || undefined,
      evidence: { supporting: [], contradicting: [] },
      strength,
      newStrength: 1,
      triggers: [],
      affirmations: [],
      status: 'identified',
      practiceCount: 0
    })
  }
  
  return (
    <div className="cascade-card p-6">
      <h2 className="text-xl font-bold text-zinc-100 mb-6">Identify Limiting Script</h2>
      
      {/* Common Scripts */}
      <div className="mb-6">
        <p className="text-sm text-zinc-400 mb-2">Common Limiting Scripts</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SCRIPTS.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setOriginal(s.original)
                setCategory(s.category)
              }}
              className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded text-sm hover:bg-zinc-700"
            >
              {s.original}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">The Limiting Belief/Story</label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="I am not... I can't... I don't deserve..."
            rows={2}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Category</label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {(Object.entries(CATEGORY_INFO) as [ScriptCategory, typeof CATEGORY_INFO[ScriptCategory]][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`p-2 rounded-lg text-xs transition-all ${
                  category === key
                    ? `bg-${info.color}-500/20 border border-${info.color}-500/50`
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                <span className="text-lg block">{info.icon}</span>
                <span className="text-zinc-400">{info.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">How strongly do you hold this belief? (1-10)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={strength}
            onChange={(e) => setStrength(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-zinc-600">
            <span>Weak</span>
            <span className="text-red-400 font-bold">{strength}</span>
            <span>Very Strong</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Where did this come from? (optional)</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Childhood, parent, teacher, experience..."
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Rewritten Empowering Version (optional)</label>
          <textarea
            value={rewritten}
            onChange={(e) => setRewritten(e.target.value)}
            placeholder="I am... I can... I deserve..."
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
            disabled={!original.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-emerald-500 text-white font-medium rounded-lg disabled:opacity-50"
          >
            Identify Script
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function LifeScriptPage() {
  const [scripts, setScripts] = useState<LifeScript[]>([])
  const [selectedScript, setSelectedScript] = useState<LifeScript | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<'all' | LifeScript['status']>('all')
  
  // Load scripts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-life-scripts')
      if (saved) setScripts(JSON.parse(saved))
    }
  }, [])
  
  const saveScript = (script: Omit<LifeScript, 'id' | 'createdAt'>) => {
    const newScript: LifeScript = {
      ...script,
      id: `script-${Date.now()}`,
      createdAt: Date.now()
    }
    
    const updated = [newScript, ...scripts]
    setScripts(updated)
    localStorage.setItem('cascade-life-scripts', JSON.stringify(updated))
    setShowCreate(false)
  }
  
  const updateScript = (updated: LifeScript) => {
    const newScripts = scripts.map(s => s.id === updated.id ? updated : s)
    setScripts(newScripts)
    localStorage.setItem('cascade-life-scripts', JSON.stringify(newScripts))
    setSelectedScript(updated)
  }
  
  const filteredScripts = filter === 'all' 
    ? scripts 
    : scripts.filter(s => s.status === filter)
  
  // Stats
  const integrated = scripts.filter(s => s.status === 'integrated').length
  const totalPractice = scripts.reduce((sum, s) => sum + s.practiceCount, 0)
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Life Script Editor</h1>
        <p className="text-zinc-500">Identify and rewrite your limiting narratives</p>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{scripts.length}</p>
          <p className="text-xs text-zinc-500">Scripts Identified</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{scripts.filter(s => s.rewritten).length}</p>
          <p className="text-xs text-zinc-500">Rewritten</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{integrated}</p>
          <p className="text-xs text-zinc-500">Integrated</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{totalPractice}</p>
          <p className="text-xs text-zinc-500">Practice Sessions</p>
        </div>
      </div>
      
      {showCreate ? (
        <CreateScriptForm onSave={saveScript} onCancel={() => setShowCreate(false)} />
      ) : selectedScript ? (
        <ScriptDetailView 
          script={selectedScript} 
          onUpdate={updateScript}
          onClose={() => setSelectedScript(null)}
        />
      ) : (
        <>
          <button
            onClick={() => setShowCreate(true)}
            className="w-full mb-6 py-4 cascade-card text-center text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            + Identify New Limiting Script
          </button>
          
          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {['all', 'identified', 'questioning', 'rewriting', 'integrated'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  filter === f
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          
          {filteredScripts.length === 0 ? (
            <div className="cascade-card p-12 text-center">
              <p className="text-4xl mb-4">📜</p>
              <p className="text-zinc-400">No limiting scripts identified yet</p>
              <p className="text-sm text-zinc-600">Start rewriting your story</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScripts.map(script => (
                <ScriptCard 
                  key={script.id} 
                  script={script}
                  onSelect={() => setSelectedScript(script)}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Philosophy */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-red-500/5 to-emerald-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">📜 On Life Scripts</h3>
        <p className="text-sm text-zinc-400 mb-3">
          We all carry unconscious narratives - stories we tell ourselves about who we are, 
          what we deserve, and what's possible. These scripts were often written in childhood 
          and run silently in the background, shaping our reality.
        </p>
        <p className="text-sm text-zinc-500">
          By bringing them into awareness, questioning their validity, and consciously 
          rewriting them, we reclaim authorship of our lives. The old story loses power 
          each time we practice the new one.
        </p>
      </div>
    </div>
  )
}
