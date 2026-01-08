'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface GratitudeEntry {
  id: string
  items: string[]
  timestamp: number
  lamague: string
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GratitudePage() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([])
  const [todayItems, setTodayItems] = useState<string[]>(['', '', ''])
  const [saved, setSaved] = useState(false)
  
  const today = new Date().toDateString()
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEntries = localStorage.getItem('cascade-gratitude')
      if (savedEntries) {
        const parsed = JSON.parse(savedEntries)
        setEntries(parsed)
        
        // Check if today already has entry
        const todayEntry = parsed.find((e: GratitudeEntry) => 
          new Date(e.timestamp).toDateString() === today
        )
        if (todayEntry) {
          setTodayItems(todayEntry.items)
          setSaved(true)
        }
      }
    }
  }, [today])
  
  const saveToday = () => {
    const filledItems = todayItems.filter(i => i.trim())
    if (filledItems.length === 0) return
    
    const entry: GratitudeEntry = {
      id: `grat-${Date.now()}`,
      items: filledItems,
      timestamp: Date.now(),
      lamague: '✧'
    }
    
    // Remove existing today entry if any
    const filtered = entries.filter(e => 
      new Date(e.timestamp).toDateString() !== today
    )
    
    const updated = [entry, ...filtered]
    setEntries(updated)
    localStorage.setItem('cascade-gratitude', JSON.stringify(updated))
    setSaved(true)
  }
  
  // Stats
  const streak = (() => {
    let count = 0
    const checkDate = new Date()
    
    while (count < 365) {
      const dateStr = checkDate.toDateString()
      const hasEntry = entries.some(e => 
        new Date(e.timestamp).toDateString() === dateStr
      )
      
      if (hasEntry) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (dateStr === today) {
        // Today hasn't been done yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return count
  })()
  
  const totalItems = entries.reduce((sum, e) => sum + e.items.length, 0)
  
  // Get last 7 days for display
  const recentEntries = entries.slice(0, 7)
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-8 text-center">
        <span className="text-5xl mb-4 block">✧</span>
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Gratitude</h1>
        <p className="text-zinc-500">Notice what's already good</p>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">🔥 {streak}</p>
          <p className="text-xs text-zinc-500">Day Streak</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-pink-400">{entries.length}</p>
          <p className="text-xs text-zinc-500">Days Practiced</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{totalItems}</p>
          <p className="text-xs text-zinc-500">Things Noticed</p>
        </div>
      </div>
      
      {/* Today's Entry */}
      <div className="cascade-card p-6 mb-8 bg-gradient-to-br from-amber-500/5 to-pink-500/5">
        <h2 className="text-lg font-medium text-zinc-200 mb-4">
          {saved ? "Today's Gratitude ✓" : "What are you grateful for today?"}
        </h2>
        
        <div className="space-y-3">
          {todayItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl text-amber-400">{i + 1}.</span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...todayItems]
                  newItems[i] = e.target.value
                  setTodayItems(newItems)
                  setSaved(false)
                }}
                placeholder={`Gratitude ${i + 1}...`}
                disabled={saved}
                className={`flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 ${saved ? 'opacity-75' : ''}`}
              />
            </div>
          ))}
        </div>
        
        {!saved && (
          <button
            onClick={saveToday}
            disabled={todayItems.every(i => !i.trim())}
            className="w-full mt-4 py-3 bg-amber-500 text-zinc-900 font-medium rounded-lg disabled:opacity-50"
          >
            Save Gratitude ✧
          </button>
        )}
        
        {saved && (
          <button
            onClick={() => setSaved(false)}
            className="w-full mt-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg"
          >
            Edit
          </button>
        )}
      </div>
      
      {/* Add more items */}
      {todayItems.length < 10 && !saved && (
        <button
          onClick={() => setTodayItems([...todayItems, ''])}
          className="w-full mb-8 py-2 bg-zinc-800 text-zinc-500 rounded-lg hover:bg-zinc-700"
        >
          + Add more
        </button>
      )}
      
      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-zinc-200 mb-4">Recent Gratitude</h2>
          <div className="space-y-4">
            {recentEntries.map(entry => (
              <div key={entry.id} className="cascade-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-zinc-500">
                    {new Date(entry.timestamp).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="font-mono text-amber-400">{entry.lamague}</span>
                </div>
                <ul className="space-y-1">
                  {entry.items.map((item, i) => (
                    <li key={i} className="text-zinc-300 text-sm">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Philosophy */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-amber-500/5 to-pink-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">✧ Why Gratitude?</h3>
        <p className="text-sm text-zinc-400">
          Gratitude rewires attention. What you appreciate, appreciates. 
          Daily practice shifts focus from lack to abundance, from anxiety 
          to presence. This isn't positive thinking — it's accurate perceiving 
          of what's already good.
        </p>
      </div>
    </div>
  )
}
