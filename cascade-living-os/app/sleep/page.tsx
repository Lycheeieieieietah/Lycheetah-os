'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface SleepEntry {
  id: string
  bedtime: string // HH:MM
  waketime: string
  quality: 1 | 2 | 3 | 4 | 5
  duration: number // hours
  notes?: string
  timestamp: number
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function SleepPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [bedtime, setBedtime] = useState('22:30')
  const [waketime, setWaketime] = useState('06:30')
  const [quality, setQuality] = useState<1|2|3|4|5>(3)
  const [notes, setNotes] = useState('')
  
  const today = new Date().toDateString()
  const hasTodayEntry = entries.some(e => 
    new Date(e.timestamp).toDateString() === today
  )
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-sleep')
      if (saved) setEntries(JSON.parse(saved))
    }
  }, [])
  
  useEffect(() => {
    if (typeof window !== 'undefined' && entries.length > 0) {
      localStorage.setItem('cascade-sleep', JSON.stringify(entries))
    }
  }, [entries])
  
  const calculateDuration = (bed: string, wake: string): number => {
    const [bedH, bedM] = bed.split(':').map(Number)
    const [wakeH, wakeM] = wake.split(':').map(Number)
    
    let bedMins = bedH * 60 + bedM
    let wakeMins = wakeH * 60 + wakeM
    
    // If waketime is earlier, assume next day
    if (wakeMins <= bedMins) {
      wakeMins += 24 * 60
    }
    
    return (wakeMins - bedMins) / 60
  }
  
  const logSleep = () => {
    const duration = calculateDuration(bedtime, waketime)
    
    const entry: SleepEntry = {
      id: `sleep-${Date.now()}`,
      bedtime,
      waketime,
      quality,
      duration,
      notes: notes.trim() || undefined,
      timestamp: Date.now()
    }
    
    // Remove existing today entry
    const filtered = entries.filter(e => 
      new Date(e.timestamp).toDateString() !== today
    )
    
    setEntries([entry, ...filtered])
    setNotes('')
  }
  
  // Stats
  const last7 = entries.slice(0, 7)
  const avgDuration = last7.length > 0
    ? last7.reduce((sum, e) => sum + e.duration, 0) / last7.length
    : 0
  const avgQuality = last7.length > 0
    ? last7.reduce((sum, e) => sum + e.quality, 0) / last7.length
    : 0
  
  const qualityEmojis = ['😴', '😔', '😐', '😊', '🌟']
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-8 text-center">
        <span className="text-5xl mb-4 block">🌙</span>
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Sleep</h1>
        <p className="text-zinc-500">Rest is the foundation of sovereignty</p>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">{avgDuration.toFixed(1)}h</p>
          <p className="text-xs text-zinc-500">Avg Duration (7d)</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl">{qualityEmojis[Math.round(avgQuality) - 1] || '—'}</p>
          <p className="text-xs text-zinc-500">Avg Quality</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{entries.length}</p>
          <p className="text-xs text-zinc-500">Total Logs</p>
        </div>
      </div>
      
      {/* Log Today */}
      <div className="cascade-card p-6 mb-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
        <h2 className="text-lg font-medium text-zinc-200 mb-4">
          {hasTodayEntry ? "Today's Sleep ✓" : "Log Last Night's Sleep"}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Bedtime</label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Wake Time</label>
            <input
              type="time"
              value={waketime}
              onChange={(e) => setWaketime(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="text-xs text-zinc-500 block mb-2">Sleep Quality</label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`flex-1 py-3 rounded-lg text-xl transition-all ${
                  quality === q
                    ? 'bg-indigo-500/30 scale-110'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                {qualityEmojis[q - 1]}
              </button>
            ))}
          </div>
        </div>
        
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional): dreams, interruptions..."
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 mb-4"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">
            Duration: <span className="text-indigo-400 font-bold">
              {calculateDuration(bedtime, waketime).toFixed(1)}h
            </span>
          </span>
          <button
            onClick={logSleep}
            className="px-6 py-2 bg-indigo-500 text-zinc-900 font-medium rounded-lg"
          >
            Log Sleep
          </button>
        </div>
      </div>
      
      {/* 7-Day Chart */}
      <div className="cascade-card p-6 mb-8">
        <h3 className="text-lg font-medium text-zinc-200 mb-4">Last 7 Days</h3>
        <div className="flex items-end gap-2 h-32">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            const dateStr = date.toDateString()
            const entry = entries.find(e => 
              new Date(e.timestamp).toDateString() === dateStr
            )
            
            const height = entry ? (entry.duration / 10) * 100 : 0
            const qualityColor = entry 
              ? entry.quality >= 4 ? 'bg-emerald-500' 
                : entry.quality >= 3 ? 'bg-indigo-500' 
                : 'bg-amber-500'
              : 'bg-zinc-800'
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-zinc-800 rounded-t relative" style={{ height: '100px' }}>
                  <div 
                    className={`absolute bottom-0 w-full ${qualityColor} rounded-t transition-all`}
                    style={{ height: `${height}%` }}
                    title={entry ? `${entry.duration.toFixed(1)}h - Quality: ${entry.quality}` : 'No data'}
                  />
                </div>
                <span className="text-xs text-zinc-600">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Recent Entries */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-zinc-200">Recent Logs</h3>
        {entries.slice(0, 5).map(entry => (
          <div key={entry.id} className="cascade-card p-4 flex items-center gap-4">
            <span className="text-2xl">{qualityEmojis[entry.quality - 1]}</span>
            <div className="flex-1">
              <p className="text-sm text-zinc-400">
                {new Date(entry.timestamp).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-zinc-300">
                {entry.bedtime} → {entry.waketime} 
                <span className="text-indigo-400 ml-2">({entry.duration.toFixed(1)}h)</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
