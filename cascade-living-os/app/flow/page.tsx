'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCascadeData } from '@/lib/hooks/use-cascade-data'

// ============================================================================
// TYPES
// ============================================================================

interface FlowStep {
  id: string
  title: string
  description: string
  duration?: number // seconds
  action?: () => void
  link?: string
  completed: boolean
  lamague: string
}

// ============================================================================
// FLOW STEP COMPONENT
// ============================================================================

function FlowStepCard({ 
  step, 
  index, 
  isActive,
  onComplete 
}: { 
  step: FlowStep
  index: number
  isActive: boolean
  onComplete: () => void
}) {
  const [timer, setTimer] = useState(step.duration || 0)
  const [running, setRunning] = useState(false)
  
  useEffect(() => {
    if (!running || timer <= 0) return
    
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          setRunning(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [running, timer])
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      step.completed 
        ? 'border-emerald-500/30 bg-emerald-500/5' 
        : isActive 
          ? 'border-cyan-500/30 bg-cyan-500/5' 
          : 'border-zinc-800 bg-zinc-900/50'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          step.completed 
            ? 'bg-emerald-500/30 text-emerald-400' 
            : isActive 
              ? 'bg-cyan-500/30 text-cyan-400' 
              : 'bg-zinc-800 text-zinc-500'
        }`}>
          {step.completed ? '✓' : index + 1}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium ${step.completed ? 'text-zinc-400' : 'text-zinc-200'}`}>
              {step.title}
            </h3>
            <span className="font-mono text-purple-400 text-sm">{step.lamague}</span>
          </div>
          <p className="text-sm text-zinc-500 mb-3">{step.description}</p>
          
          {!step.completed && isActive && (
            <div className="flex items-center gap-3">
              {step.duration && step.duration > 0 && (
                <div className="flex items-center gap-2">
                  {!running ? (
                    <button
                      onClick={() => { setTimer(step.duration!); setRunning(true) }}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm"
                    >
                      Start Timer ({formatTime(step.duration)})
                    </button>
                  ) : (
                    <span className="font-mono text-cyan-400">{formatTime(timer)}</span>
                  )}
                </div>
              )}
              
              {step.link && (
                <Link
                  href={step.link}
                  className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm"
                >
                  Open →
                </Link>
              )}
              
              <button
                onClick={onComplete}
                className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm ml-auto"
              >
                Complete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function FlowPage() {
  const { metrics } = useCascadeData()
  const [mode, setMode] = useState<'morning' | 'evening'>('morning')
  const [steps, setSteps] = useState<FlowStep[]>([])
  const [activeStep, setActiveStep] = useState(0)
  
  const hour = new Date().getHours()
  
  useEffect(() => {
    // Auto-detect mode based on time
    if (hour >= 17 || hour < 4) {
      setMode('evening')
    } else {
      setMode('morning')
    }
  }, [hour])
  
  useEffect(() => {
    const morningSteps: FlowStep[] = [
      {
        id: 'm1',
        title: 'Center',
        description: 'Take 3 deep breaths. Feel your body. Return to your invariant.',
        duration: 60,
        lamague: '⟟',
        completed: false
      },
      {
        id: 'm2',
        title: 'Gratitude',
        description: 'Name 3 things you\'re grateful for this morning.',
        duration: 90,
        lamague: '✧',
        completed: false
      },
      {
        id: 'm3',
        title: 'Intention',
        description: 'What is your primary intention for today? What matters most?',
        duration: 60,
        lamague: 'Φ↑',
        completed: false
      },
      {
        id: 'm4',
        title: 'Energy Check',
        description: 'Log your current energy and mood levels.',
        link: '/energy',
        lamague: '≋',
        completed: false
      },
      {
        id: 'm5',
        title: 'Review Rituals',
        description: 'Check your daily rituals and commitments.',
        link: '/rituals',
        lamague: '⟲',
        completed: false
      },
      {
        id: 'm6',
        title: 'First Microorcim',
        description: 'Fire your first μ of the day. Start with intention.',
        link: '/microorcim',
        lamague: '⚡',
        completed: false
      }
    ]
    
    const eveningSteps: FlowStep[] = [
      {
        id: 'e1',
        title: 'Pause',
        description: 'Stop. Take 3 breaths. Let the day settle.',
        duration: 60,
        lamague: '⟟',
        completed: false
      },
      {
        id: 'e2',
        title: 'Review Day',
        description: 'What happened today? What did you accomplish?',
        duration: 120,
        lamague: 'Ψ',
        completed: false
      },
      {
        id: 'e3',
        title: 'Acknowledge Wins',
        description: 'Name at least 1 win from today, no matter how small.',
        duration: 60,
        lamague: '✧',
        completed: false
      },
      {
        id: 'e4',
        title: 'Journal',
        description: 'Write your evening reflection.',
        link: '/journal',
        lamague: 'Ψ',
        completed: false
      },
      {
        id: 'e5',
        title: 'Energy Log',
        description: 'Record your end-of-day energy and mood.',
        link: '/energy',
        lamague: '≋',
        completed: false
      },
      {
        id: 'e6',
        title: 'Tomorrow\'s Intention',
        description: 'What is the one thing that matters most tomorrow?',
        duration: 60,
        lamague: 'Φ↑',
        completed: false
      },
      {
        id: 'e7',
        title: 'Release',
        description: 'Let go of the day. What\'s done is done. Rest now.',
        duration: 30,
        lamague: '⟲',
        completed: false
      }
    ]
    
    setSteps(mode === 'morning' ? morningSteps : eveningSteps)
    setActiveStep(0)
  }, [mode])
  
  const completeStep = (index: number) => {
    setSteps(prev => prev.map((s, i) => 
      i === index ? { ...s, completed: true } : s
    ))
    if (index < steps.length - 1) {
      setActiveStep(index + 1)
    }
  }
  
  const completedCount = steps.filter(s => s.completed).length
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0
  
  const phaseGlyph = metrics?.phase.glyph || '✧'
  const phaseName = metrics?.phase.name || 'Flow'
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setMode('morning')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'morning'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            ☀️ Morning
          </button>
          <button
            onClick={() => setMode('evening')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'evening'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            🌙 Evening
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">
          {mode === 'morning' ? 'Morning Flow' : 'Evening Flow'}
        </h1>
        <p className="text-zinc-500">
          {mode === 'morning' 
            ? 'Begin the day with intention and clarity' 
            : 'Close the day with reflection and peace'
          }
        </p>
        
        {/* Phase indicator */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-lg">
          <span className="font-mono text-purple-400">{phaseGlyph}</span>
          <span className="text-sm text-zinc-400">{phaseName} Phase</span>
        </div>
      </header>
      
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-zinc-500">{completedCount} of {steps.length} complete</span>
          <span className="text-cyan-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <FlowStepCard
            key={step.id}
            step={step}
            index={index}
            isActive={index === activeStep}
            onComplete={() => completeStep(index)}
          />
        ))}
      </div>
      
      {/* Completion */}
      {completedCount === steps.length && steps.length > 0 && (
        <div className="mt-8 p-6 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 text-center">
          <p className="text-2xl mb-2">✧</p>
          <h3 className="text-lg font-medium text-emerald-400 mb-2">
            {mode === 'morning' ? 'Morning Flow Complete' : 'Evening Flow Complete'}
          </h3>
          <p className="text-sm text-zinc-400">
            {mode === 'morning' 
              ? 'You\'ve set the foundation. Now go build something meaningful.' 
              : 'The day is complete. Rest well. Tomorrow is waiting.'
            }
          </p>
        </div>
      )}
      
      {/* Philosophy */}
      <div className="mt-8 p-6 cascade-card bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">
          {mode === 'morning' ? 'Why Morning Flow?' : 'Why Evening Flow?'}
        </h3>
        <p className="text-sm text-zinc-400">
          {mode === 'morning' 
            ? 'The morning sets the trajectory. Before the world claims your attention, you claim your intention. This flow anchors you in your invariant (⟟), activates intention (Φ↑), and prepares you to fire microorcims with clarity.'
            : 'The evening completes the cycle (⟲). Without reflection, experience doesn\'t become wisdom. This flow processes the day, extracts lessons, and releases what doesn\'t serve you. Sleep consolidates memory; this ritual prepares it.'
          }
        </p>
      </div>
    </div>
  )
}
