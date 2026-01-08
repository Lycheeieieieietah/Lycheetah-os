'use client'

import { useState, useEffect, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface BreathPattern {
  id: string
  name: string
  description: string
  lamague: string
  inhale: number // seconds
  holdIn: number
  exhale: number
  holdOut: number
  cycles: number
  benefits: string[]
}

interface BreathSession {
  id: string
  patternId: string
  timestamp: number
  completed: boolean
  duration: number // seconds
}

// ============================================================================
// BREATH PATTERNS
// ============================================================================

const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal duration inhale, hold, exhale, hold. Used by Navy SEALs for calm focus.',
    lamague: '⟟',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    cycles: 4,
    benefits: ['Stress reduction', 'Focus enhancement', 'Emotional regulation']
  },
  {
    id: '478',
    name: '4-7-8 Relaxing',
    description: 'Extended exhale activates parasympathetic nervous system. Deep relaxation.',
    lamague: '≋',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    cycles: 4,
    benefits: ['Sleep preparation', 'Anxiety relief', 'Nervous system reset']
  },
  {
    id: 'wim-hof',
    name: 'Power Breath',
    description: 'Energizing breath with extended inhale. Increases alertness and energy.',
    lamague: 'Φ↑',
    inhale: 3,
    holdIn: 0,
    exhale: 2,
    holdOut: 0,
    cycles: 30,
    benefits: ['Energy boost', 'Mental clarity', 'Immune activation']
  },
  {
    id: 'calm',
    name: 'Calm Wave',
    description: 'Gentle, slow breathing for centering. Perfect for meditation prep.',
    lamague: 'Ψ',
    inhale: 5,
    holdIn: 2,
    exhale: 6,
    holdOut: 2,
    cycles: 6,
    benefits: ['Deep calm', 'Meditation prep', 'Heart rate reduction']
  }
]

// ============================================================================
// BREATH VISUALIZER
// ============================================================================

function BreathVisualizer({ 
  phase, 
  progress,
  pattern
}: { 
  phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut' | 'idle'
  progress: number
  pattern: BreathPattern
}) {
  const phaseColors = {
    inhale: 'from-cyan-500 to-emerald-500',
    holdIn: 'from-emerald-500 to-amber-500',
    exhale: 'from-amber-500 to-purple-500',
    holdOut: 'from-purple-500 to-cyan-500',
    idle: 'from-zinc-700 to-zinc-600'
  }
  
  const phaseLabels = {
    inhale: 'Breathe In',
    holdIn: 'Hold',
    exhale: 'Breathe Out',
    holdOut: 'Hold',
    idle: 'Ready'
  }
  
  // Calculate circle size based on phase
  const getScale = () => {
    if (phase === 'idle') return 0.6
    if (phase === 'inhale') return 0.6 + (progress * 0.4)
    if (phase === 'holdIn') return 1
    if (phase === 'exhale') return 1 - (progress * 0.4)
    return 0.6
  }
  
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
      
      {/* Animated circle */}
      <div 
        className={`absolute inset-4 rounded-full bg-gradient-to-br ${phaseColors[phase]} transition-transform duration-300`}
        style={{ 
          transform: `scale(${getScale()})`,
          opacity: phase === 'idle' ? 0.3 : 0.6
        }}
      />
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-medium text-zinc-100">{phaseLabels[phase]}</p>
        {phase !== 'idle' && (
          <p className="text-4xl font-mono text-zinc-300 mt-2">
            {Math.ceil((1 - progress) * (
              phase === 'inhale' ? pattern.inhale :
              phase === 'holdIn' ? pattern.holdIn :
              phase === 'exhale' ? pattern.exhale :
              pattern.holdOut
            ))}
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// PATTERN SELECTOR
// ============================================================================

function PatternCard({ 
  pattern, 
  selected,
  onSelect 
}: { 
  pattern: BreathPattern
  selected: boolean
  onSelect: () => void
}) {
  const totalCycleTime = pattern.inhale + pattern.holdIn + pattern.exhale + pattern.holdOut
  const totalTime = totalCycleTime * pattern.cycles
  
  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-lg border text-left transition-all ${
        selected 
          ? 'border-cyan-500/50 bg-cyan-500/10' 
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl font-mono text-purple-400">{pattern.lamague}</span>
        <h3 className="font-medium text-zinc-200">{pattern.name}</h3>
      </div>
      <p className="text-xs text-zinc-500 mb-2">{pattern.description}</p>
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <span>{pattern.inhale}-{pattern.holdIn}-{pattern.exhale}-{pattern.holdOut}</span>
        <span>•</span>
        <span>{pattern.cycles} cycles</span>
        <span>•</span>
        <span>{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</span>
      </div>
    </button>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function BreathPage() {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(BREATH_PATTERNS[0])
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState<'inhale' | 'holdIn' | 'exhale' | 'holdOut' | 'idle'>('idle')
  const [progress, setProgress] = useState(0)
  const [currentCycle, setCurrentCycle] = useState(0)
  const [sessions, setSessions] = useState<BreathSession[]>([])
  
  const startTimeRef = useRef<number>(0)
  const phaseStartRef = useRef<number>(0)
  
  // Load sessions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-breath-sessions')
      if (saved) setSessions(JSON.parse(saved))
    }
  }, [])
  
  // Save sessions
  useEffect(() => {
    if (typeof window !== 'undefined' && sessions.length > 0) {
      localStorage.setItem('cascade-breath-sessions', JSON.stringify(sessions))
    }
  }, [sessions])
  
  // Breathing timer
  useEffect(() => {
    if (!isRunning) return
    
    const pattern = selectedPattern
    const phases = [
      { name: 'inhale' as const, duration: pattern.inhale },
      { name: 'holdIn' as const, duration: pattern.holdIn },
      { name: 'exhale' as const, duration: pattern.exhale },
      { name: 'holdOut' as const, duration: pattern.holdOut }
    ].filter(p => p.duration > 0)
    
    let phaseIndex = 0
    let cycle = 0
    phaseStartRef.current = Date.now()
    setPhase(phases[0].name)
    setCurrentCycle(1)
    
    const tick = () => {
      const elapsed = (Date.now() - phaseStartRef.current) / 1000
      const currentPhaseDuration = phases[phaseIndex].duration
      const phaseProgress = elapsed / currentPhaseDuration
      
      if (phaseProgress >= 1) {
        // Move to next phase
        phaseIndex++
        
        if (phaseIndex >= phases.length) {
          // Complete cycle
          phaseIndex = 0
          cycle++
          setCurrentCycle(cycle + 1)
          
          if (cycle >= pattern.cycles) {
            // Complete session
            setIsRunning(false)
            setPhase('idle')
            setProgress(0)
            setCurrentCycle(0)
            
            // Save session
            const session: BreathSession = {
              id: `breath-${Date.now()}`,
              patternId: pattern.id,
              timestamp: startTimeRef.current,
              completed: true,
              duration: Math.round((Date.now() - startTimeRef.current) / 1000)
            }
            setSessions(prev => [session, ...prev])
            return
          }
        }
        
        phaseStartRef.current = Date.now()
        setPhase(phases[phaseIndex].name)
        setProgress(0)
      } else {
        setProgress(phaseProgress)
      }
    }
    
    const interval = setInterval(tick, 50)
    return () => clearInterval(interval)
  }, [isRunning, selectedPattern])
  
  const startSession = () => {
    startTimeRef.current = Date.now()
    setIsRunning(true)
  }
  
  const stopSession = () => {
    setIsRunning(false)
    setPhase('idle')
    setProgress(0)
    setCurrentCycle(0)
  }
  
  // Stats
  const todaySessions = sessions.filter(s => 
    new Date(s.timestamp).toDateString() === new Date().toDateString()
  )
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60)
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Breathwork</h1>
        <p className="text-zinc-500">Guided breathing for sovereignty and calm</p>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{todaySessions.length}</p>
          <p className="text-xs text-zinc-500">Sessions Today</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{sessions.length}</p>
          <p className="text-xs text-zinc-500">Total Sessions</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{totalMinutes}m</p>
          <p className="text-xs text-zinc-500">Total Practice</p>
        </div>
      </div>
      
      {/* Visualizer */}
      <div className="cascade-card p-8 mb-8">
        <BreathVisualizer 
          phase={phase} 
          progress={progress} 
          pattern={selectedPattern}
        />
        
        {/* Cycle counter */}
        {isRunning && (
          <div className="text-center mt-4">
            <p className="text-sm text-zinc-500">
              Cycle {currentCycle} of {selectedPattern.cycles}
            </p>
          </div>
        )}
        
        {/* Controls */}
        <div className="flex justify-center mt-6">
          {isRunning ? (
            <button
              onClick={stopSession}
              className="px-8 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={startSession}
              className="px-8 py-3 bg-cyan-500 text-zinc-900 font-medium rounded-lg hover:bg-cyan-400 transition-colors"
            >
              Begin {selectedPattern.name}
            </button>
          )}
        </div>
      </div>
      
      {/* Pattern Selector */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-zinc-200 mb-4">Choose Pattern</h2>
        <div className="grid grid-cols-2 gap-4">
          {BREATH_PATTERNS.map(pattern => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              selected={selectedPattern.id === pattern.id}
              onSelect={() => !isRunning && setSelectedPattern(pattern)}
            />
          ))}
        </div>
      </div>
      
      {/* Benefits */}
      <div className="cascade-card p-6 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">
          {selectedPattern.lamague} {selectedPattern.name} Benefits
        </h3>
        <div className="flex flex-wrap gap-2">
          {selectedPattern.benefits.map((benefit, i) => (
            <span key={i} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded text-sm">
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
