'use client'

import { useState, useEffect, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface QuantumState {
  id: string
  option: string
  amplitude: number  // Probability amplitude (complex in theory, real here)
  phase: number      // Phase angle in radians
  description?: string
}

interface QuantumDecision {
  id: string
  question: string
  states: QuantumState[]
  collapsed: boolean
  collapsedTo?: string
  collapseMethod?: 'observation' | 'intention' | 'random' | 'resonance'
  reasoning?: string
  createdAt: number
  collapsedAt?: number
}

interface CollapseHistory {
  decisionId: string
  question: string
  result: string
  method: string
  satisfaction: number  // 1-5 how satisfied after
  timestamp: number
}

// ============================================================================
// QUANTUM VISUALIZATION
// ============================================================================

function SuperpositionVisual({ 
  states, 
  collapsed, 
  collapsedTo,
  onCollapse 
}: { 
  states: QuantumState[]
  collapsed: boolean
  collapsedTo?: string
  onCollapse: (stateId: string, method: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [hovered, setHovered] = useState<string | null>(null)
  
  // Animate probability cloud
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    let time = 0
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.min(centerX, centerY) - 20
      
      if (collapsed) {
        // Collapsed state - single point
        const collapsedState = states.find(s => s.id === collapsedTo)
        if (collapsedState) {
          const angle = states.indexOf(collapsedState) * (2 * Math.PI / states.length) - Math.PI / 2
          const x = centerX + maxRadius * 0.7 * Math.cos(angle)
          const y = centerY + maxRadius * 0.7 * Math.sin(angle)
          
          // Glow
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40)
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)')
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, 40, 0, Math.PI * 2)
          ctx.fill()
          
          // Point
          ctx.fillStyle = 'rgb(168, 85, 247)'
          ctx.beginPath()
          ctx.arc(x, y, 8, 0, Math.PI * 2)
          ctx.fill()
        }
      } else {
        // Superposition - probability cloud
        states.forEach((state, i) => {
          const baseAngle = i * (2 * Math.PI / states.length) - Math.PI / 2
          const probability = state.amplitude * state.amplitude
          
          // Oscillating radius based on phase
          const oscillation = Math.sin(time * 0.02 + state.phase) * 10
          const radius = maxRadius * 0.7 + oscillation
          
          const x = centerX + radius * Math.cos(baseAngle)
          const y = centerY + radius * Math.sin(baseAngle)
          
          // Probability cloud
          const size = 20 + probability * 40
          const alpha = 0.3 + probability * 0.5
          
          // Interference pattern
          for (let j = 0; j < 5; j++) {
            const offset = Math.sin(time * 0.03 + j) * 5
            const cloudX = x + offset
            const cloudY = y + Math.cos(time * 0.03 + j) * 5
            
            const gradient = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, size)
            gradient.addColorStop(0, `rgba(6, 182, 212, ${alpha})`)
            gradient.addColorStop(0.5, `rgba(168, 85, 247, ${alpha * 0.5})`)
            gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')
            
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(cloudX, cloudY, size, 0, Math.PI * 2)
            ctx.fill()
          }
          
          // Option label
          ctx.fillStyle = hovered === state.id ? 'rgb(6, 182, 212)' : 'rgb(161, 161, 170)'
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          const labelRadius = maxRadius + 20
          const labelX = centerX + labelRadius * Math.cos(baseAngle)
          const labelY = centerY + labelRadius * Math.sin(baseAngle)
          ctx.fillText(state.option, labelX, labelY)
          
          // Probability
          ctx.font = '12px monospace'
          ctx.fillStyle = 'rgb(6, 182, 212)'
          ctx.fillText(`${(probability * 100).toFixed(0)}%`, labelX, labelY + 16)
        })
        
        // Center
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.beginPath()
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2)
        ctx.fill()
      }
      
      time++
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [states, collapsed, collapsedTo, hovered])
  
  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400}
        className="mx-auto"
      />
      
      {/* Collapse buttons */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
          <button
            onClick={() => {
              const random = states[Math.floor(Math.random() * states.length)]
              onCollapse(random.id, 'random')
            }}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded text-sm hover:bg-zinc-700"
          >
            🎲 Random Collapse
          </button>
          <button
            onClick={() => {
              const maxProb = Math.max(...states.map(s => s.amplitude * s.amplitude))
              const highest = states.find(s => s.amplitude * s.amplitude === maxProb)
              if (highest) onCollapse(highest.id, 'resonance')
            }}
            className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded text-sm hover:bg-purple-500/30"
          >
            ✧ Resonance Collapse
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// AMPLITUDE ADJUSTER
// ============================================================================

function AmplitudeAdjuster({ 
  states, 
  onChange 
}: { 
  states: QuantumState[]
  onChange: (states: QuantumState[]) => void 
}) {
  const adjustAmplitude = (id: string, delta: number) => {
    const updated = states.map(s => {
      if (s.id === id) {
        const newAmp = Math.max(0.1, Math.min(1, s.amplitude + delta))
        return { ...s, amplitude: newAmp }
      }
      return s
    })
    
    // Normalize
    const totalSq = updated.reduce((sum, s) => sum + s.amplitude * s.amplitude, 0)
    const normalized = updated.map(s => ({
      ...s,
      amplitude: s.amplitude / Math.sqrt(totalSq)
    }))
    
    onChange(normalized)
  }
  
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-400">Adjust probability amplitudes:</p>
      {states.map(state => {
        const probability = state.amplitude * state.amplitude
        return (
          <div key={state.id} className="flex items-center gap-3">
            <span className="text-sm text-zinc-300 w-32 truncate">{state.option}</span>
            <button
              onClick={() => adjustAmplitude(state.id, -0.1)}
              className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              -
            </button>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                style={{ width: `${probability * 100}%` }}
              />
            </div>
            <button
              onClick={() => adjustAmplitude(state.id, 0.1)}
              className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              +
            </button>
            <span className="text-sm text-cyan-400 w-12 text-right">
              {(probability * 100).toFixed(0)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// CREATE DECISION FORM
// ============================================================================

function CreateDecisionForm({ 
  onSave, 
  onCancel 
}: { 
  onSave: (decision: Omit<QuantumDecision, 'id' | 'createdAt'>) => void
  onCancel: () => void
}) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  
  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ''])
    }
  }
  
  const updateOption = (index: number, value: string) => {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }
  
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }
  
  const handleSubmit = () => {
    const validOptions = options.filter(o => o.trim())
    if (!question.trim() || validOptions.length < 2) return
    
    // Create equal superposition
    const amplitude = 1 / Math.sqrt(validOptions.length)
    const states: QuantumState[] = validOptions.map((opt, i) => ({
      id: `state-${Date.now()}-${i}`,
      option: opt,
      amplitude,
      phase: (2 * Math.PI * i) / validOptions.length
    }))
    
    onSave({
      question,
      states,
      collapsed: false
    })
  }
  
  return (
    <div className="cascade-card p-6">
      <h2 className="text-xl font-bold text-zinc-100 mb-6">Enter Quantum Superposition</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Decision Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What decision are you facing?"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Options (Possible States)</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}...`}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    className="px-3 text-zinc-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button onClick={addOption} className="mt-2 text-sm text-cyan-400">
              + Add Option
            </button>
          )}
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
          >
            Enter Superposition
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function QuantumOraclePage() {
  const [decisions, setDecisions] = useState<QuantumDecision[]>([])
  const [activeDecision, setActiveDecision] = useState<QuantumDecision | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [history, setHistory] = useState<CollapseHistory[]>([])
  
  // Load data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-quantum-decisions')
      if (saved) setDecisions(JSON.parse(saved))
      
      const hist = localStorage.getItem('cascade-collapse-history')
      if (hist) setHistory(JSON.parse(hist))
    }
  }, [])
  
  const saveDecision = (decision: Omit<QuantumDecision, 'id' | 'createdAt'>) => {
    const newDecision: QuantumDecision = {
      ...decision,
      id: `qd-${Date.now()}`,
      createdAt: Date.now()
    }
    
    const updated = [newDecision, ...decisions]
    setDecisions(updated)
    localStorage.setItem('cascade-quantum-decisions', JSON.stringify(updated))
    setActiveDecision(newDecision)
    setShowCreate(false)
  }
  
  const updateStates = (states: QuantumState[]) => {
    if (!activeDecision) return
    
    const updated = { ...activeDecision, states }
    setActiveDecision(updated)
    
    const newDecisions = decisions.map(d => d.id === updated.id ? updated : d)
    setDecisions(newDecisions)
    localStorage.setItem('cascade-quantum-decisions', JSON.stringify(newDecisions))
  }
  
  const collapseWavefunction = (stateId: string, method: string) => {
    if (!activeDecision) return
    
    const collapsedState = activeDecision.states.find(s => s.id === stateId)
    if (!collapsedState) return
    
    const updated: QuantumDecision = {
      ...activeDecision,
      collapsed: true,
      collapsedTo: stateId,
      collapseMethod: method as QuantumDecision['collapseMethod'],
      collapsedAt: Date.now()
    }
    
    setActiveDecision(updated)
    
    const newDecisions = decisions.map(d => d.id === updated.id ? updated : d)
    setDecisions(newDecisions)
    localStorage.setItem('cascade-quantum-decisions', JSON.stringify(newDecisions))
    
    // Add to history
    const newHistory: CollapseHistory = {
      decisionId: updated.id,
      question: updated.question,
      result: collapsedState.option,
      method,
      satisfaction: 0,
      timestamp: Date.now()
    }
    const updatedHistory = [newHistory, ...history].slice(0, 50)
    setHistory(updatedHistory)
    localStorage.setItem('cascade-collapse-history', JSON.stringify(updatedHistory))
  }
  
  // Stats
  const totalDecisions = decisions.length
  const collapsedCount = decisions.filter(d => d.collapsed).length
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Quantum Decision Oracle</h1>
        <p className="text-zinc-500">Hold decisions in superposition until observation collapses them</p>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{totalDecisions - collapsedCount}</p>
          <p className="text-xs text-zinc-500">In Superposition</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{collapsedCount}</p>
          <p className="text-xs text-zinc-500">Collapsed</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{history.length}</p>
          <p className="text-xs text-zinc-500">Total Observations</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Area */}
        <div className="lg:col-span-2">
          {showCreate ? (
            <CreateDecisionForm onSave={saveDecision} onCancel={() => setShowCreate(false)} />
          ) : activeDecision ? (
            <div className="cascade-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-medium text-zinc-200">{activeDecision.question}</h2>
                  <p className="text-sm text-zinc-500">
                    {activeDecision.collapsed ? 'Wavefunction collapsed' : 'In superposition'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveDecision(null)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              </div>
              
              {/* Visualization */}
              <div className="mb-6">
                <SuperpositionVisual
                  states={activeDecision.states}
                  collapsed={activeDecision.collapsed}
                  collapsedTo={activeDecision.collapsedTo}
                  onCollapse={collapseWavefunction}
                />
              </div>
              
              {/* Collapsed Result */}
              {activeDecision.collapsed && activeDecision.collapsedTo && (
                <div className="p-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg text-center">
                  <p className="text-xs text-purple-400 mb-2">Collapsed to:</p>
                  <p className="text-2xl font-bold text-zinc-100">
                    {activeDecision.states.find(s => s.id === activeDecision.collapsedTo)?.option}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">
                    Method: {activeDecision.collapseMethod}
                  </p>
                </div>
              )}
              
              {/* Amplitude Adjuster */}
              {!activeDecision.collapsed && (
                <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
                  <AmplitudeAdjuster 
                    states={activeDecision.states} 
                    onChange={updateStates}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowCreate(true)}
                className="w-full mb-6 py-4 cascade-card text-center text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
              >
                + Enter New Superposition
              </button>
              
              {decisions.length === 0 ? (
                <div className="cascade-card p-12 text-center">
                  <p className="text-4xl mb-4">⚛️</p>
                  <p className="text-zinc-400">No quantum decisions yet</p>
                  <p className="text-sm text-zinc-600">Create a superposition of possibilities</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {decisions.slice(0, 10).map(decision => (
                    <button
                      key={decision.id}
                      onClick={() => setActiveDecision(decision)}
                      className={`w-full cascade-card p-4 text-left hover:border-cyan-500/30 transition-all ${
                        decision.collapsed ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-zinc-200">{decision.question}</h3>
                          <p className="text-sm text-zinc-500">
                            {decision.states.length} states • {decision.collapsed ? 'Collapsed' : 'Superposition'}
                          </p>
                        </div>
                        <span className="text-2xl">
                          {decision.collapsed ? '◉' : '◎'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Collapses */}
          <div className="cascade-card p-6">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Recent Observations</h3>
            {history.length === 0 ? (
              <p className="text-sm text-zinc-500">No collapses yet</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 5).map(h => (
                  <div key={h.timestamp} className="p-2 bg-zinc-800/50 rounded">
                    <p className="text-sm text-zinc-300 line-clamp-1">{h.question}</p>
                    <p className="text-xs text-purple-400">→ {h.result}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Philosophy */}
          <div className="cascade-card p-6 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
            <h3 className="text-lg font-medium text-zinc-200 mb-3">⚛️ Quantum Decision Theory</h3>
            <div className="space-y-3 text-sm text-zinc-400">
              <p>
                <strong className="text-cyan-400">Superposition:</strong> Hold multiple possibilities 
                simultaneously without premature commitment.
              </p>
              <p>
                <strong className="text-purple-400">Amplitude:</strong> Your intuitive probability 
                weights. Adjust them based on inner resonance.
              </p>
              <p>
                <strong className="text-amber-400">Collapse:</strong> The act of observation 
                crystallizes one possibility into reality.
              </p>
            </div>
            <p className="text-xs text-zinc-500 mt-4 italic">
              "The universe is not locally real. Neither are your decisions until observed."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
