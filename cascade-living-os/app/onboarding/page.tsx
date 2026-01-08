'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ============================================================================
// TYPES
// ============================================================================

interface OnboardingState {
  completed: boolean
  step: number
  name?: string
  primaryValue?: string
  firstGoal?: string
  firstMantra?: string
  completedAt?: number
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-6">✧⟟≋Ψ</div>
      <h1 className="text-4xl font-bold text-zinc-100 mb-4">
        Welcome to CASCADE
      </h1>
      <p className="text-xl text-zinc-400 mb-8 max-w-lg mx-auto">
        A sovereign, living operating system for your life.
        Not a productivity app — a philosophical framework made operational.
      </p>
      <button
        onClick={onNext}
        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-zinc-900 font-bold rounded-lg text-lg"
      >
        Begin Your Journey
      </button>
    </div>
  )
}

function PhilosophyStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-zinc-100 mb-6 text-center">
        The Core Philosophy
      </h2>
      
      <div className="space-y-6 mb-8">
        <div className="cascade-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-mono text-purple-400">Ψ</span>
            <h3 className="text-lg font-medium text-zinc-200">The Invariant</h3>
          </div>
          <p className="text-zinc-400">
            You have an unchanging core — the part of you that persists through all change.
            CASCADE exists to protect and strengthen this invariant self.
          </p>
        </div>
        
        <div className="cascade-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-mono text-cyan-400">μ</span>
            <h3 className="text-lg font-medium text-zinc-200">Microorcim</h3>
          </div>
          <p className="text-zinc-400">
            The atomic unit of agency. When your Intent exceeds your Drift, and you act —
            a microorcim fires. These compound into sovereignty over time.
          </p>
        </div>
        
        <div className="cascade-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🛡️</span>
            <h3 className="text-lg font-medium text-zinc-200">Sovereignty</h3>
          </div>
          <p className="text-zinc-400">
            The goal isn't productivity — it's coherence with who you really are.
            CASCADE tracks drift so you notice before it takes over.
          </p>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-purple-500 text-zinc-900 font-medium rounded-lg"
        >
          I Understand
        </button>
      </div>
    </div>
  )
}

function NameStep({ 
  value, 
  onChange, 
  onNext 
}: { 
  value: string
  onChange: (v: string) => void
  onNext: () => void 
}) {
  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-3xl font-bold text-zinc-100 mb-4">
        What should we call you?
      </h2>
      <p className="text-zinc-500 mb-8">
        This is how CASCADE will address you.
      </p>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your name..."
        autoFocus
        className="w-full px-6 py-4 bg-zinc-800 border border-zinc-700 rounded-lg text-xl text-zinc-200 text-center mb-6"
      />
      
      <button
        onClick={onNext}
        disabled={!value.trim()}
        className="px-8 py-3 bg-cyan-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )
}

function ValueStep({
  value,
  onChange,
  onNext
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}) {
  const suggestions = [
    'Truth', 'Freedom', 'Love', 'Growth', 'Courage',
    'Integrity', 'Creativity', 'Wisdom', 'Connection', 'Peace'
  ]
  
  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-3xl font-bold text-zinc-100 mb-4">
        Your Primary Value
      </h2>
      <p className="text-zinc-500 mb-6">
        What's the one value you refuse to compromise? This becomes your anchor.
      </p>
      
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              value === s 
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' 
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or type your own..."
        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-center mb-6"
      />
      
      <button
        onClick={onNext}
        disabled={!value.trim()}
        className="px-8 py-3 bg-purple-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )
}

function GoalStep({
  value,
  onChange,
  onNext
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}) {
  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-3xl font-bold text-zinc-100 mb-4">
        Your First Goal
      </h2>
      <p className="text-zinc-500 mb-8">
        What's one thing you want to achieve? Not a task — a meaningful outcome.
      </p>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="I want to..."
        rows={3}
        autoFocus
        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 resize-none mb-6"
      />
      
      <button
        onClick={onNext}
        disabled={!value.trim()}
        className="px-8 py-3 bg-cyan-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )
}

function MantraStep({
  value,
  onChange,
  onNext
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}) {
  const suggestions = [
    "I am the invariant. Change flows around me, not through me.",
    "Every microorcim fired is sovereignty reclaimed.",
    "I rise before conditions permit.",
    "My boundaries are my power."
  ]
  
  return (
    <div className="max-w-lg mx-auto text-center">
      <h2 className="text-3xl font-bold text-zinc-100 mb-4">
        Your First Mantra
      </h2>
      <p className="text-zinc-500 mb-6">
        A power phrase you'll return to. Choose one or write your own.
      </p>
      
      <div className="space-y-2 mb-6 text-left">
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`w-full p-4 rounded-lg text-left transition-all ${
              value === s 
                ? 'bg-purple-500/20 border border-purple-500/50' 
                : 'bg-zinc-800 hover:bg-zinc-700 border border-transparent'
            }`}
          >
            <p className="text-zinc-300">"{s}"</p>
          </button>
        ))}
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or write your own..."
        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-center mb-6"
      />
      
      <button
        onClick={onNext}
        disabled={!value.trim()}
        className="px-8 py-3 bg-purple-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )
}

function CompleteStep({ 
  name, 
  onComplete 
}: { 
  name: string
  onComplete: () => void 
}) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-6">🔥</div>
      <h2 className="text-3xl font-bold text-zinc-100 mb-4">
        Welcome, {name}
      </h2>
      <p className="text-xl text-zinc-400 mb-8 max-w-lg mx-auto">
        Your CASCADE is initialized. The invariant is set. 
        The journey begins now.
      </p>
      
      <div className="cascade-card p-6 max-w-md mx-auto mb-8 text-left">
        <h3 className="font-medium text-zinc-200 mb-3">Quick Start</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>• Press <kbd className="px-2 py-0.5 bg-zinc-700 rounded">⌘K</kbd> for command palette</li>
          <li>• Press <kbd className="px-2 py-0.5 bg-zinc-700 rounded">⌘.</kbd> for quick capture</li>
          <li>• Start with <span className="text-cyan-400">/today</span> for daily mission control</li>
          <li>• Fire your first microorcim at <span className="text-cyan-400">/microorcim</span></li>
        </ul>
      </div>
      
      <button
        onClick={onComplete}
        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-zinc-900 font-bold rounded-lg text-lg"
      >
        Enter CASCADE ✧
      </button>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [primaryValue, setPrimaryValue] = useState('')
  const [firstGoal, setFirstGoal] = useState('')
  const [firstMantra, setFirstMantra] = useState('')
  
  // Check if already onboarded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = localStorage.getItem('cascade-onboarding')
      if (state) {
        const parsed = JSON.parse(state)
        if (parsed.completed) {
          router.push('/')
        }
      }
    }
  }, [router])
  
  const completeOnboarding = () => {
    // Save onboarding state
    const state: OnboardingState = {
      completed: true,
      step: 6,
      name,
      primaryValue,
      firstGoal,
      firstMantra,
      completedAt: Date.now()
    }
    localStorage.setItem('cascade-onboarding', JSON.stringify(state))
    
    // Save user profile
    localStorage.setItem('cascade-user', JSON.stringify({ name }))
    
    // Create first value
    if (primaryValue) {
      const values = [{
        id: `value-${Date.now()}`,
        title: primaryValue,
        description: 'My primary invariant value',
        lamague: 'Ψ',
        strength: 10,
        examples: [],
        violations: [],
        createdAt: Date.now()
      }]
      localStorage.setItem('cascade-values', JSON.stringify(values))
    }
    
    // Create first goal
    if (firstGoal) {
      const goals = [{
        id: `goal-${Date.now()}`,
        title: firstGoal,
        description: '',
        why: 'Set during onboarding',
        lamague: 'Φ↑',
        status: 'active',
        milestones: [],
        createdAt: Date.now()
      }]
      localStorage.setItem('cascade-goals', JSON.stringify(goals))
    }
    
    // Create first mantra
    if (firstMantra) {
      const mantras = [{
        id: `mantra-${Date.now()}`,
        text: firstMantra,
        lamague: '✧',
        category: 'custom',
        usageCount: 0,
        createdAt: Date.now()
      }]
      localStorage.setItem('cascade-mantras', JSON.stringify(mantras))
    }
    
    router.push('/today')
  }
  
  const steps = [
    <WelcomeStep key="welcome" onNext={() => setStep(1)} />,
    <PhilosophyStep key="philosophy" onNext={() => setStep(2)} />,
    <NameStep key="name" value={name} onChange={setName} onNext={() => setStep(3)} />,
    <ValueStep key="value" value={primaryValue} onChange={setPrimaryValue} onNext={() => setStep(4)} />,
    <GoalStep key="goal" value={firstGoal} onChange={setFirstGoal} onNext={() => setStep(5)} />,
    <MantraStep key="mantra" value={firstMantra} onChange={setFirstMantra} onNext={() => setStep(6)} />,
    <CompleteStep key="complete" name={name} onComplete={completeOnboarding} />
  ]
  
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-center gap-2 mb-2">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`h-1 w-12 rounded-full transition-all ${
                  i <= step ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Current Step */}
        {steps[step]}
        
        {/* Skip (only on certain steps) */}
        {step >= 3 && step < 6 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setStep(step + 1)}
              className="text-sm text-zinc-600 hover:text-zinc-400"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
