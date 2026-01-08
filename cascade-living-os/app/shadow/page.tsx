'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface ShadowAspect {
  id: string
  name: string
  description: string
  triggers: string[]
  manifestations: string[]  // How it shows up in behavior
  gifts: string[]          // The gold hidden in the shadow
  integrationLevel: number // 0-100
  encounters: ShadowEncounter[]
  lamague: string
  createdAt: number
}

interface ShadowEncounter {
  id: string
  context: string
  triggered: boolean
  response: 'projected' | 'suppressed' | 'acknowledged' | 'integrated'
  reflection?: string
  timestamp: number
}

interface ShadowPrompt {
  question: string
  category: 'discovery' | 'trigger' | 'gift' | 'integration'
}

// ============================================================================
// PROMPTS FOR SHADOW WORK
// ============================================================================

const SHADOW_PROMPTS: ShadowPrompt[] = [
  { question: "What quality in others triggers the strongest reaction in you?", category: 'discovery' },
  { question: "What behavior do you judge most harshly in others?", category: 'discovery' },
  { question: "What are you most afraid others will discover about you?", category: 'discovery' },
  { question: "What do you never want to be seen as?", category: 'discovery' },
  { question: "When did this shadow first appear in your life?", category: 'trigger' },
  { question: "What were you protecting yourself from when this pattern formed?", category: 'trigger' },
  { question: "What positive quality might be hidden in this shadow?", category: 'gift' },
  { question: "How could this trait serve you if consciously integrated?", category: 'gift' },
  { question: "Can you hold this part of yourself with compassion?", category: 'integration' },
  { question: "What would change if you fully accepted this aspect?", category: 'integration' }
]

const RESPONSE_INFO = {
  projected: { icon: '🪞', label: 'Projected', description: 'Saw it in someone else, reacted strongly' },
  suppressed: { icon: '🚫', label: 'Suppressed', description: 'Pushed it down, denied it' },
  acknowledged: { icon: '👁️', label: 'Acknowledged', description: 'Noticed it without judgment' },
  integrated: { icon: '✧', label: 'Integrated', description: 'Embraced and transformed it' }
}

// ============================================================================
// SHADOW ASPECT CARD
// ============================================================================

function ShadowCard({ 
  shadow, 
  onUpdate,
  onSelect
}: { 
  shadow: ShadowAspect
  onUpdate: (updated: ShadowAspect) => void
  onSelect: () => void
}) {
  const recentEncounters = shadow.encounters.slice(-5)
  const integrationColor = shadow.integrationLevel < 30 ? 'red' : 
                          shadow.integrationLevel < 60 ? 'amber' : 
                          shadow.integrationLevel < 85 ? 'cyan' : 'emerald'
  
  return (
    <div 
      className="cascade-card p-5 cursor-pointer hover:border-purple-500/30 transition-all"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono text-purple-400">{shadow.lamague}</span>
            <h3 className="font-medium text-zinc-200">{shadow.name}</h3>
          </div>
          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{shadow.description}</p>
        </div>
      </div>
      
      {/* Integration meter */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-zinc-500">Integration</span>
          <span className={`text-${integrationColor}-400`}>{shadow.integrationLevel}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-${integrationColor}-500 transition-all`}
            style={{ width: `${shadow.integrationLevel}%` }}
          />
        </div>
      </div>
      
      {/* Recent encounters */}
      {recentEncounters.length > 0 && (
        <div className="flex gap-1">
          {recentEncounters.map(enc => (
            <span key={enc.id} className="text-lg" title={RESPONSE_INFO[enc.response].label}>
              {RESPONSE_INFO[enc.response].icon}
            </span>
          ))}
        </div>
      )}
      
      {/* Gifts hint */}
      {shadow.gifts.length > 0 && (
        <p className="text-xs text-amber-400 mt-2">
          🌟 Hidden gift: {shadow.gifts[0]}
        </p>
      )}
    </div>
  )
}

// ============================================================================
// SHADOW DETAIL VIEW
// ============================================================================

function ShadowDetailView({ 
  shadow, 
  onUpdate, 
  onClose 
}: { 
  shadow: ShadowAspect
  onUpdate: (updated: ShadowAspect) => void
  onClose: () => void
}) {
  const [showEncounterForm, setShowEncounterForm] = useState(false)
  const [encounterContext, setEncounterContext] = useState('')
  const [encounterResponse, setEncounterResponse] = useState<ShadowEncounter['response']>('acknowledged')
  const [reflection, setReflection] = useState('')
  
  const logEncounter = () => {
    const newEncounter: ShadowEncounter = {
      id: `enc-${Date.now()}`,
      context: encounterContext,
      triggered: true,
      response: encounterResponse,
      reflection: reflection || undefined,
      timestamp: Date.now()
    }
    
    // Adjust integration based on response
    let integrationDelta = 0
    switch (encounterResponse) {
      case 'projected': integrationDelta = -2; break
      case 'suppressed': integrationDelta = -1; break
      case 'acknowledged': integrationDelta = 3; break
      case 'integrated': integrationDelta = 5; break
    }
    
    const updated = {
      ...shadow,
      encounters: [...shadow.encounters, newEncounter],
      integrationLevel: Math.max(0, Math.min(100, shadow.integrationLevel + integrationDelta))
    }
    
    onUpdate(updated)
    setShowEncounterForm(false)
    setEncounterContext('')
    setReflection('')
  }
  
  return (
    <div className="cascade-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-mono text-purple-400">{shadow.lamague}</span>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">{shadow.name}</h2>
              <p className="text-sm text-zinc-500">Shadow Aspect</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">✕</button>
      </div>
      
      {/* Description */}
      <p className="text-zinc-400 mb-6">{shadow.description}</p>
      
      {/* Integration Meter */}
      <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-zinc-400">Integration Progress</span>
          <span className="text-lg font-bold text-purple-400">{shadow.integrationLevel}%</span>
        </div>
        <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 via-cyan-500 to-emerald-500 transition-all"
            style={{ width: `${shadow.integrationLevel}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-zinc-600">
          <span>Unconscious</span>
          <span>Integrated</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Triggers */}
        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
          <h4 className="text-sm font-medium text-red-400 mb-2">⚡ Triggers</h4>
          {shadow.triggers.length > 0 ? (
            <ul className="space-y-1">
              {shadow.triggers.map((t, i) => (
                <li key={i} className="text-sm text-zinc-400">• {t}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">No triggers identified yet</p>
          )}
        </div>
        
        {/* Manifestations */}
        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
          <h4 className="text-sm font-medium text-amber-400 mb-2">🎭 Manifestations</h4>
          {shadow.manifestations.length > 0 ? (
            <ul className="space-y-1">
              {shadow.manifestations.map((m, i) => (
                <li key={i} className="text-sm text-zinc-400">• {m}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">No manifestations identified</p>
          )}
        </div>
      </div>
      
      {/* Gifts */}
      <div className="mb-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
        <h4 className="text-sm font-medium text-emerald-400 mb-2">🌟 Hidden Gifts</h4>
        {shadow.gifts.length > 0 ? (
          <ul className="space-y-1">
            {shadow.gifts.map((g, i) => (
              <li key={i} className="text-sm text-zinc-300">✧ {g}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">What positive quality might be hidden here?</p>
        )}
      </div>
      
      {/* Log Encounter */}
      {showEncounterForm ? (
        <div className="p-4 bg-zinc-800/50 rounded-lg space-y-4">
          <h4 className="font-medium text-zinc-200">Log Shadow Encounter</h4>
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">What happened?</label>
            <textarea
              value={encounterContext}
              onChange={(e) => setEncounterContext(e.target.value)}
              placeholder="Describe the situation..."
              rows={2}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">How did you respond?</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(RESPONSE_INFO) as Array<keyof typeof RESPONSE_INFO>).map(resp => (
                <button
                  key={resp}
                  onClick={() => setEncounterResponse(resp)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    encounterResponse === resp
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-lg">{RESPONSE_INFO[resp].icon}</span>
                  <p className="text-sm text-zinc-300">{RESPONSE_INFO[resp].label}</p>
                  <p className="text-xs text-zinc-500">{RESPONSE_INFO[resp].description}</p>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Reflection (optional)</label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you learn?"
              rows={2}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowEncounterForm(false)}
              className="flex-1 py-2 bg-zinc-700 text-zinc-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={logEncounter}
              disabled={!encounterContext.trim()}
              className="flex-1 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50"
            >
              Log Encounter
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowEncounterForm(true)}
          className="w-full py-3 cascade-card text-center text-zinc-400 hover:text-purple-400 hover:border-purple-500/30"
        >
          + Log Shadow Encounter
        </button>
      )}
      
      {/* Encounter History */}
      {shadow.encounters.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-zinc-400 mb-3">Recent Encounters</h4>
          <div className="space-y-2">
            {shadow.encounters.slice(-5).reverse().map(enc => (
              <div key={enc.id} className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span>{RESPONSE_INFO[enc.response].icon}</span>
                  <span className="text-sm text-zinc-300">{RESPONSE_INFO[enc.response].label}</span>
                  <span className="text-xs text-zinc-600">
                    {new Date(enc.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">{enc.context}</p>
                {enc.reflection && (
                  <p className="text-xs text-purple-400 mt-1 italic">↳ {enc.reflection}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// CREATE SHADOW FORM
// ============================================================================

function CreateShadowForm({ 
  onSave, 
  onCancel 
}: { 
  onSave: (shadow: Omit<ShadowAspect, 'id' | 'createdAt' | 'encounters'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggers, setTriggers] = useState('')
  const [manifestations, setManifestations] = useState('')
  const [gifts, setGifts] = useState('')
  const [lamague, setLamague] = useState('∅')
  const [promptIndex, setPromptIndex] = useState(0)
  
  const currentPrompt = SHADOW_PROMPTS[promptIndex]
  
  const nextPrompt = () => {
    setPromptIndex((promptIndex + 1) % SHADOW_PROMPTS.length)
  }
  
  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) return
    
    onSave({
      name,
      description,
      triggers: triggers.split('\n').filter(t => t.trim()),
      manifestations: manifestations.split('\n').filter(m => m.trim()),
      gifts: gifts.split('\n').filter(g => g.trim()),
      integrationLevel: 10,
      lamague
    })
  }
  
  return (
    <div className="cascade-card p-6">
      <h2 className="text-xl font-bold text-zinc-100 mb-6">Identify Shadow Aspect</h2>
      
      {/* Prompt */}
      <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-sm text-purple-400 mb-1">Reflection Prompt</p>
        <p className="text-zinc-200 italic">"{currentPrompt.question}"</p>
        <button onClick={nextPrompt} className="text-xs text-purple-400 mt-2">
          Next prompt →
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Shadow Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., The Critic, The Pleaser, The Controller..."
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this shadow aspect..."
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Triggers (one per line)</label>
          <textarea
            value={triggers}
            onChange={(e) => setTriggers(e.target.value)}
            placeholder="What activates this shadow?"
            rows={2}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">How It Manifests (one per line)</label>
          <textarea
            value={manifestations}
            onChange={(e) => setManifestations(e.target.value)}
            placeholder="How does this show up in your behavior?"
            rows={2}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Hidden Gifts (one per line)</label>
          <textarea
            value={gifts}
            onChange={(e) => setGifts(e.target.value)}
            placeholder="What positive quality might be hidden here?"
            rows={2}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">LAMAGUE Symbol</label>
          <div className="flex gap-2">
            {['∅', '∂', '▽', '⟲', 'Ψ', '✧'].map(sym => (
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
        
        <div className="flex gap-3 pt-4">
          <button onClick={onCancel} className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !description.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg disabled:opacity-50"
          >
            Create Shadow
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ShadowWorkPage() {
  const [shadows, setShadows] = useState<ShadowAspect[]>([])
  const [selectedShadow, setSelectedShadow] = useState<ShadowAspect | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  
  // Load shadows
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-shadows')
      if (saved) setShadows(JSON.parse(saved))
    }
  }, [])
  
  const saveShadow = (shadow: Omit<ShadowAspect, 'id' | 'createdAt' | 'encounters'>) => {
    const newShadow: ShadowAspect = {
      ...shadow,
      id: `shadow-${Date.now()}`,
      encounters: [],
      createdAt: Date.now()
    }
    
    const updated = [newShadow, ...shadows]
    setShadows(updated)
    localStorage.setItem('cascade-shadows', JSON.stringify(updated))
    setShowCreate(false)
  }
  
  const updateShadow = (updated: ShadowAspect) => {
    const newShadows = shadows.map(s => s.id === updated.id ? updated : s)
    setShadows(newShadows)
    localStorage.setItem('cascade-shadows', JSON.stringify(newShadows))
    setSelectedShadow(updated)
  }
  
  // Stats
  const avgIntegration = shadows.length > 0
    ? shadows.reduce((sum, s) => sum + s.integrationLevel, 0) / shadows.length
    : 0
  const totalEncounters = shadows.reduce((sum, s) => sum + s.encounters.length, 0)
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Shadow Work</h1>
        <p className="text-zinc-500">Integrate the unconscious for wholeness</p>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{shadows.length}</p>
          <p className="text-xs text-zinc-500">Shadow Aspects</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{Math.round(avgIntegration)}%</p>
          <p className="text-xs text-zinc-500">Avg Integration</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{totalEncounters}</p>
          <p className="text-xs text-zinc-500">Encounters Logged</p>
        </div>
      </div>
      
      {showCreate ? (
        <CreateShadowForm onSave={saveShadow} onCancel={() => setShowCreate(false)} />
      ) : selectedShadow ? (
        <ShadowDetailView 
          shadow={selectedShadow} 
          onUpdate={updateShadow}
          onClose={() => setSelectedShadow(null)}
        />
      ) : (
        <>
          <button
            onClick={() => setShowCreate(true)}
            className="w-full mb-6 py-4 cascade-card text-center text-zinc-400 hover:text-purple-400 hover:border-purple-500/30 transition-all"
          >
            + Identify New Shadow Aspect
          </button>
          
          {shadows.length === 0 ? (
            <div className="cascade-card p-12 text-center">
              <p className="text-4xl mb-4">🌑</p>
              <p className="text-zinc-400">No shadows identified yet</p>
              <p className="text-sm text-zinc-600">Begin your shadow work journey</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shadows.map(shadow => (
                <ShadowCard 
                  key={shadow.id} 
                  shadow={shadow}
                  onUpdate={updateShadow}
                  onSelect={() => setSelectedShadow(shadow)}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Philosophy */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">🌑 The Shadow Path</h3>
        <p className="text-sm text-zinc-400 mb-4">
          "One does not become enlightened by imagining figures of light, but by making 
          the darkness conscious." — Carl Jung
        </p>
        <p className="text-sm text-zinc-500">
          The shadow contains not just our wounds, but our gold. Every rejected part holds 
          energy that, when integrated, becomes strength. Track your encounters, notice your 
          projections, and gradually transform unconscious reactions into conscious responses.
        </p>
      </div>
    </div>
  )
}
