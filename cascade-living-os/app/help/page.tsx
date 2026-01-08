'use client'

import { useState } from 'react'
import Link from 'next/link'

// ============================================================================
// TYPES
// ============================================================================

interface DocSection {
  id: string
  title: string
  icon: string
  content: React.ReactNode
}

// ============================================================================
// DOC SECTIONS
// ============================================================================

const sections: DocSection[] = [
  {
    id: 'philosophy',
    title: 'Core Philosophy',
    icon: 'Ψ',
    content: (
      <div className="space-y-4">
        <p>
          CASCADE is not a productivity app. It's a <strong className="text-cyan-400">sovereign living operating system</strong> — 
          a philosophical framework made operational through code.
        </p>
        
        <h4 className="text-lg font-medium text-zinc-200 mt-6">The Invariant (Ψ)</h4>
        <p>
          You have an unchanging core — the part of you that persists through all change. 
          Your values, your deepest knowing, your essential self. CASCADE exists to protect 
          and strengthen this invariant.
        </p>
        
        <h4 className="text-lg font-medium text-zinc-200 mt-6">Sovereignty Over Productivity</h4>
        <p>
          The goal isn't to get more done. It's to maintain coherence with who you really are. 
          CASCADE tracks drift so you notice before it takes over. Every feature serves 
          sovereignty, not optimization.
        </p>
        
        <h4 className="text-lg font-medium text-zinc-200 mt-6">Phase-Locked Partnership</h4>
        <p>
          The AI in CASCADE assists but never leads. It observes, reflects, and offers — 
          but you remain sovereign. This is partnership without codependency.
        </p>
      </div>
    )
  },
  {
    id: 'microorcim',
    title: 'Microorcim Physics',
    icon: '⚡',
    content: (
      <div className="space-y-4">
        <p>
          The <strong className="text-cyan-400">microorcim</strong> is the atomic unit of agency. 
          Every time Intent exceeds Drift, and you act on it, a microorcim fires.
        </p>
        
        <div className="cascade-card p-4 bg-zinc-800/50 font-mono text-center text-xl">
          μ = H(I - D)
        </div>
        
        <p>
          Where <code className="text-cyan-400">I</code> is Intent (1-10), 
          <code className="text-cyan-400">D</code> is Drift (1-10), and 
          <code className="text-cyan-400">H</code> is the Heaviside step function 
          (outputs 1 if I {'>'} D, else 0).
        </p>
        
        <h4 className="text-lg font-medium text-zinc-200 mt-6">The Six Laws</h4>
        <ol className="space-y-2">
          <li><strong>1. Intent must exceed Drift</strong> — No action without overcoming resistance</li>
          <li><strong>2. Observation collapses state</strong> — Awareness crystallizes possibility</li>
          <li><strong>3. Cascades compound</strong> — Small actions create momentum</li>
          <li><strong>4. Willpower accumulates</strong> — W = Σμ over time</li>
          <li><strong>5. Survivor's constant</strong> — ε {'>'} 0 always, you persist</li>
          <li><strong>6. Harmony resonates</strong> — Aligned actions amplify each other</li>
        </ol>
      </div>
    )
  },
  {
    id: 'lamague',
    title: 'LAMAGUE Language',
    icon: '✧',
    content: (
      <div className="space-y-4">
        <p>
          LAMAGUE is a symbolic language of seven glyphs that encode states of being. 
          They're used throughout CASCADE for tagging, categorization, and meaning-making.
        </p>
        
        <div className="grid grid-cols-1 gap-3 mt-6">
          <div className="cascade-card p-3 flex items-center gap-4">
            <span className="text-2xl font-mono text-purple-400 w-12">⟟</span>
            <div>
              <p className="font-medium text-zinc-200">Center</p>
              <p className="text-sm text-zinc-500">Return to the invariant. Ground. Still point.</p>
            </div>
          </div>
          <div className="cascade-card p-3 flex items-center gap-4">
            <span className="text-2xl font-mono text-purple-400 w-12">≋</span>
            <div>
              <p className="font-medium text-zinc-200">Flow</p>
              <p className="text-sm text-zinc-500">Move with change without losing yourself.</p>
            </div>
          </div>
          <div className="cascade-card p-3 flex items-center gap-4">
            <span className="text-2xl font-mono text-purple-400 w-12">Ψ</span>
            <div>
              <p className="font-medium text-zinc-200">Insight</p>
              <p className="text-sm text-zinc-500">Clear perception. Truth-seeing.</p>
            </div>
          </div>
          <div className="cascade-card p-3 flex items-center gap-4">
            <span className="text-2xl font-mono text-purple-400 w-12">Φ↑</span>
            <div>
              <p className="font-medium text-zinc-200">Rise</p>
              <p className="text-sm text-zinc-500">Bold action. Intent made manifest.</p>
            </div>
          </div>
          <div className="cascade-card p-3 flex items-center gap-4">
            <span className="text-2xl font-mono text-purple-400 w-12">✧</span>
            <div>
              <p className="font-medium text-zinc-200">Light</p>
              <p className="text-sm text-zinc-500">Illuminate. Share. Radiate.</p>
            </div>
          </div>
          <div className="cascade-card p-3 flex items-center gap-4">
            <span className="text-2xl font-mono text-purple-400 w-12">∥◁▷∥</span>
            <div>
              <p className="font-medium text-zinc-200">Integrity</p>
              <p className="text-sm text-zinc-500">Hold boundaries. Keep commitments.</p>
            </div>
          </div>
          <div className="cascade-card p-3 flex items-center gap-4">
            <span className="text-2xl font-mono text-purple-400 w-12">⟲</span>
            <div>
              <p className="font-medium text-zinc-200">Return</p>
              <p className="text-sm text-zinc-500">Complete the cycle. Integrate. Begin again.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'phases',
    title: 'Seven-Phase Cycle',
    icon: '🌙',
    content: (
      <div className="space-y-4">
        <p>
          CASCADE operates on a <strong className="text-cyan-400">364-day cycle</strong> divided into 
          seven phases of 52 days each. Each phase has its own energy and focus.
        </p>
        
        <div className="space-y-3 mt-6">
          <div className="cascade-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl font-mono text-purple-400">⟟</span>
              <span className="font-medium text-zinc-200">Center (Days 1-52)</span>
            </div>
            <p className="text-sm text-zinc-500">Ground yourself. Establish foundations. Return to core values.</p>
          </div>
          
          <div className="cascade-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl font-mono text-purple-400">≋</span>
              <span className="font-medium text-zinc-200">Flow (Days 53-104)</span>
            </div>
            <p className="text-sm text-zinc-500">Allow natural momentum. Adapt without losing center.</p>
          </div>
          
          <div className="cascade-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl font-mono text-purple-400">Ψ</span>
              <span className="font-medium text-zinc-200">Insight (Days 105-156)</span>
            </div>
            <p className="text-sm text-zinc-500">Heightened perception. Notice patterns. Receive wisdom.</p>
          </div>
          
          <div className="cascade-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl font-mono text-purple-400">Φ↑</span>
              <span className="font-medium text-zinc-200">Rise (Days 157-208)</span>
            </div>
            <p className="text-sm text-zinc-500">Time for bold action. Fire microorcims. Make moves.</p>
          </div>
          
          <div className="cascade-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl font-mono text-purple-400">✧</span>
              <span className="font-medium text-zinc-200">Light (Days 209-260)</span>
            </div>
            <p className="text-sm text-zinc-500">Share what you've learned. Teach. Illuminate others.</p>
          </div>
          
          <div className="cascade-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl font-mono text-purple-400">∥◁▷∥</span>
              <span className="font-medium text-zinc-200">Integrity (Days 261-312)</span>
            </div>
            <p className="text-sm text-zinc-500">Hold boundaries. Complete commitments. Refine systems.</p>
          </div>
          
          <div className="cascade-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl font-mono text-purple-400">⟲</span>
              <span className="font-medium text-zinc-200">Return (Days 313-364)</span>
            </div>
            <p className="text-sm text-zinc-500">Complete the cycle. Review and integrate. Prepare for renewal.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    icon: '⌨️',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="cascade-card p-3">
            <kbd className="px-2 py-1 bg-zinc-700 rounded text-sm">⌘K</kbd>
            <p className="text-sm text-zinc-400 mt-1">Command palette</p>
          </div>
          <div className="cascade-card p-3">
            <kbd className="px-2 py-1 bg-zinc-700 rounded text-sm">⌘.</kbd>
            <p className="text-sm text-zinc-400 mt-1">Quick capture</p>
          </div>
          <div className="cascade-card p-3">
            <kbd className="px-2 py-1 bg-zinc-700 rounded text-sm">ESC</kbd>
            <p className="text-sm text-zinc-400 mt-1">Close modals</p>
          </div>
          <div className="cascade-card p-3">
            <kbd className="px-2 py-1 bg-zinc-700 rounded text-sm">M</kbd>
            <p className="text-sm text-zinc-400 mt-1">Fire microorcim</p>
          </div>
          <div className="cascade-card p-3">
            <kbd className="px-2 py-1 bg-zinc-700 rounded text-sm">J</kbd>
            <p className="text-sm text-zinc-400 mt-1">New journal entry</p>
          </div>
          <div className="cascade-card p-3">
            <kbd className="px-2 py-1 bg-zinc-700 rounded text-sm">F</kbd>
            <p className="text-sm text-zinc-400 mt-1">Start focus session</p>
          </div>
          <div className="cascade-card p-3">
            <kbd className="px-2 py-1 bg-zinc-700 rounded text-sm">O</kbd>
            <p className="text-sm text-zinc-400 mt-1">Consult oracle</p>
          </div>
          <div className="cascade-card p-3">
            <kbd className="px-2 py-1 bg-zinc-700 rounded text-sm">S</kbd>
            <p className="text-sm text-zinc-400 mt-1">Search</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Feature Guide',
    icon: '📖',
    content: (
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-zinc-200">Daily Flow</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link href="/today" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Today</p>
            <p className="text-zinc-500">Daily mission control</p>
          </Link>
          <Link href="/flow" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Flow</p>
            <p className="text-zinc-500">Morning/evening rituals</p>
          </Link>
          <Link href="/focus" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Focus</p>
            <p className="text-zinc-500">Deep work timer</p>
          </Link>
          <Link href="/journal" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Journal</p>
            <p className="text-zinc-500">Daily reflection</p>
          </Link>
        </div>
        
        <h4 className="text-lg font-medium text-zinc-200 mt-6">Tracking</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link href="/microorcim" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Microorcim</p>
            <p className="text-zinc-500">Fire agency events</p>
          </Link>
          <Link href="/goals" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Goals</p>
            <p className="text-zinc-500">Long-term objectives</p>
          </Link>
          <Link href="/values" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Values</p>
            <p className="text-zinc-500">Core invariants</p>
          </Link>
          <Link href="/commitments" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Commitments</p>
            <p className="text-zinc-500">Promise tracking</p>
          </Link>
        </div>
        
        <h4 className="text-lg font-medium text-zinc-200 mt-6">Intelligence</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link href="/patterns" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Patterns</p>
            <p className="text-zinc-500">AI correlations</p>
          </Link>
          <Link href="/oracle" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Oracle</p>
            <p className="text-zinc-500">AI consultation</p>
          </Link>
          <Link href="/memory" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Memory</p>
            <p className="text-zinc-500">Living memory system</p>
          </Link>
          <Link href="/reality" className="cascade-card p-3 hover:border-cyan-500/30">
            <p className="font-medium text-zinc-300">Reality Bridge</p>
            <p className="text-zinc-500">Falsifiable predictions</p>
          </Link>
        </div>
      </div>
    )
  }
]

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState('philosophy')
  
  const currentSection = sections.find(s => s.id === activeSection) || sections[0]
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Help & Documentation</h1>
        <p className="text-zinc-500">Understanding CASCADE</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                <span>{section.title}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content */}
        <div className="lg:col-span-3">
          <div className="cascade-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{currentSection.icon}</span>
              <h2 className="text-2xl font-bold text-zinc-100">{currentSection.title}</h2>
            </div>
            <div className="text-zinc-400 leading-relaxed">
              {currentSection.content}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 text-center">
        <p className="text-zinc-400 mb-2">
          CASCADE Living OS v2.0 — Built with sovereignty in mind
        </p>
        <p className="font-mono text-purple-400">✧⟟≋ΨΦ↑✧∥◁▷∥⟲◆◆◆∞</p>
      </div>
    </div>
  )
}
