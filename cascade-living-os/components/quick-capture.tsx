'use client'

import { useState, useEffect, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

type CaptureType = 'thought' | 'task' | 'idea' | 'question' | 'gratitude' | 'microorcim'

interface QuickCapture {
  id: string
  type: CaptureType
  content: string
  timestamp: number
  processed: boolean
  lamague?: string
}

// ============================================================================
// QUICK CAPTURE WIDGET
// ============================================================================

export function QuickCaptureWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<CaptureType>('thought')
  const [content, setContent] = useState('')
  const [captures, setCaptures] = useState<QuickCapture[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-quick-captures')
      if (saved) setCaptures(JSON.parse(saved))
    }
  }, [])
  
  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cascade-quick-captures', JSON.stringify(captures))
    }
  }, [captures])
  
  // Keyboard shortcut to open (Cmd/Ctrl + .)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])
  
  const handleCapture = () => {
    if (!content.trim()) return
    
    const capture: QuickCapture = {
      id: `cap-${Date.now()}`,
      type,
      content: content.trim(),
      timestamp: Date.now(),
      processed: false,
      lamague: type === 'microorcim' ? '⚡' : 
               type === 'idea' ? '✧' :
               type === 'question' ? 'Ψ' :
               type === 'gratitude' ? '⟟' : undefined
    }
    
    setCaptures(prev => [capture, ...prev])
    setContent('')
    setType('thought')
    
    // Close after capture
    setTimeout(() => setIsOpen(false), 300)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleCapture()
    }
  }
  
  const markProcessed = (id: string) => {
    setCaptures(prev => prev.map(c => 
      c.id === id ? { ...c, processed: true } : c
    ))
  }
  
  const deleteCapture = (id: string) => {
    setCaptures(prev => prev.filter(c => c.id !== id))
  }
  
  const typeConfig: Record<CaptureType, { icon: string; color: string; label: string }> = {
    thought: { icon: '💭', color: 'cyan', label: 'Thought' },
    task: { icon: '✓', color: 'emerald', label: 'Task' },
    idea: { icon: '💡', color: 'amber', label: 'Idea' },
    question: { icon: '❓', color: 'purple', label: 'Question' },
    gratitude: { icon: '🙏', color: 'pink', label: 'Gratitude' },
    microorcim: { icon: '⚡', color: 'yellow', label: 'Microorcim' }
  }
  
  const unprocessedCount = captures.filter(c => !c.processed).length
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 hover:border-cyan-500 shadow-lg transition-all z-40 flex items-center justify-center group"
        title="Quick Capture (⌘.)"
      >
        <svg className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {unprocessedCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-zinc-900 text-xs font-bold rounded-full flex items-center justify-center">
            {unprocessedCount > 9 ? '9+' : unprocessedCount}
          </span>
        )}
      </button>
    )
  }
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Capture Panel */}
      <div className="fixed bottom-6 left-6 w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="font-medium text-zinc-200">Quick Capture</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                showHistory ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {showHistory ? 'New' : `History (${captures.length})`}
            </button>
            <kbd className="px-2 py-1 text-xs bg-zinc-800 text-zinc-500 rounded">ESC</kbd>
          </div>
        </div>
        
        {showHistory ? (
          /* History View */
          <div className="max-h-80 overflow-y-auto">
            {captures.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <p>No captures yet</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {captures.slice(0, 20).map(capture => (
                  <div 
                    key={capture.id}
                    className={`p-3 ${capture.processed ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{typeConfig[capture.type].icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${capture.processed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                          {capture.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-600">
                            {new Date(capture.timestamp).toLocaleString()}
                          </span>
                          {capture.lamague && (
                            <span className="text-xs font-mono text-purple-400">{capture.lamague}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!capture.processed && (
                          <button
                            onClick={() => markProcessed(capture.id)}
                            className="p-1 text-zinc-600 hover:text-emerald-400 transition-colors"
                            title="Mark processed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteCapture(capture.id)}
                          className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Capture View */
          <div className="p-4">
            {/* Type Selection */}
            <div className="flex gap-1 mb-3">
              {(Object.keys(typeConfig) as CaptureType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-1.5 rounded text-xs transition-colors ${
                    type === t
                      ? `bg-${typeConfig[t].color}-500/20 text-${typeConfig[t].color}-400 border border-${typeConfig[t].color}-500/30`
                      : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                  }`}
                  style={{
                    backgroundColor: type === t ? `var(--${typeConfig[t].color}-500-20, rgba(6, 182, 212, 0.2))` : undefined,
                    color: type === t ? `var(--${typeConfig[t].color}-400, #22d3ee)` : undefined
                  }}
                >
                  {typeConfig[t].icon}
                </button>
              ))}
            </div>
            
            {/* Input */}
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Capture a ${type}...`}
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-zinc-500">
                <kbd className="px-1 bg-zinc-800 rounded">⌘</kbd>+<kbd className="px-1 bg-zinc-800 rounded">↵</kbd> to save
              </span>
              <button
                onClick={handleCapture}
                disabled={!content.trim()}
                className="px-4 py-2 bg-cyan-500 text-zinc-900 font-medium rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Capture
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ============================================================================
// INBOX PAGE COMPONENT (for processing captures)
// ============================================================================

export function InboxView() {
  const [captures, setCaptures] = useState<QuickCapture[]>([])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-quick-captures')
      if (saved) setCaptures(JSON.parse(saved))
    }
  }, [])
  
  const unprocessed = captures.filter(c => !c.processed)
  
  const markProcessed = (id: string) => {
    const updated = captures.map(c => 
      c.id === id ? { ...c, processed: true } : c
    )
    setCaptures(updated)
    localStorage.setItem('cascade-quick-captures', JSON.stringify(updated))
  }
  
  const typeConfig: Record<CaptureType, { icon: string; color: string }> = {
    thought: { icon: '💭', color: 'text-cyan-400' },
    task: { icon: '✓', color: 'text-emerald-400' },
    idea: { icon: '💡', color: 'text-amber-400' },
    question: { icon: '❓', color: 'text-purple-400' },
    gratitude: { icon: '🙏', color: 'text-pink-400' },
    microorcim: { icon: '⚡', color: 'text-yellow-400' }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-zinc-200">Inbox</h3>
        <span className="text-sm text-zinc-500">{unprocessed.length} unprocessed</span>
      </div>
      
      {unprocessed.length === 0 ? (
        <div className="cascade-card p-8 text-center">
          <p className="text-zinc-500">✨ Inbox zero!</p>
          <p className="text-xs text-zinc-600 mt-1">Press ⌘. to capture something</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unprocessed.map(capture => (
            <div 
              key={capture.id}
              className="cascade-card p-4 flex items-start gap-3"
            >
              <span className="text-xl">{typeConfig[capture.type].icon}</span>
              <div className="flex-1">
                <p className="text-zinc-200">{capture.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs ${typeConfig[capture.type].color}`}>
                    {capture.type}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {new Date(capture.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => markProcessed(capture.id)}
                className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm hover:bg-emerald-500/30 transition-colors"
              >
                Done
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
