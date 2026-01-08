'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface EnergyLog {
  id: string
  timestamp: number
  energy: 1 | 2 | 3 | 4 | 5
  mood: 1 | 2 | 3 | 4 | 5
  note?: string
}

// ============================================================================
// ENERGY TRACKER PAGE
// ============================================================================

export default function EnergyPage() {
  const [logs, setLogs] = useState<EnergyLog[]>([])
  const [energy, setEnergy] = useState<number>(3)
  const [mood, setMood] = useState<number>(3)
  const [note, setNote] = useState('')
  
  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-energy-logs')
      if (saved) setLogs(JSON.parse(saved))
    }
  }, [])
  
  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && logs.length > 0) {
      localStorage.setItem('cascade-energy-logs', JSON.stringify(logs))
    }
  }, [logs])
  
  const logEnergy = () => {
    const log: EnergyLog = {
      id: `energy-${Date.now()}`,
      timestamp: Date.now(),
      energy: energy as 1|2|3|4|5,
      mood: mood as 1|2|3|4|5,
      note: note.trim() || undefined
    }
    
    setLogs(prev => [log, ...prev])
    setNote('')
  }
  
  // Get today's logs
  const todayStr = new Date().toDateString()
  const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === todayStr)
  
  // Calculate averages
  const avgEnergy = todayLogs.length > 0
    ? todayLogs.reduce((sum, l) => sum + l.energy, 0) / todayLogs.length
    : 0
  const avgMood = todayLogs.length > 0
    ? todayLogs.reduce((sum, l) => sum + l.mood, 0) / todayLogs.length
    : 0
  
  // Get last 7 days data for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toDateString()
    const dayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === dateStr)
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      energy: dayLogs.length > 0 ? dayLogs.reduce((s, l) => s + l.energy, 0) / dayLogs.length : 0,
      mood: dayLogs.length > 0 ? dayLogs.reduce((s, l) => s + l.mood, 0) / dayLogs.length : 0,
      count: dayLogs.length
    }
  })
  
  const energyLabels = ['😴', '😔', '😐', '😊', '⚡']
  const moodLabels = ['😢', '😕', '😐', '🙂', '😄']
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Energy & Mood</h1>
        <p className="text-zinc-500">Track your daily energy and emotional state</p>
      </header>
      
      {/* Log New */}
      <div className="cascade-card p-6 mb-8">
        <h3 className="text-lg font-medium text-zinc-200 mb-4">How are you right now?</h3>
        
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Energy */}
          <div>
            <p className="text-sm text-zinc-500 mb-2">Energy Level</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setEnergy(n)}
                  className={`flex-1 py-3 rounded-lg text-xl transition-all ${
                    energy === n
                      ? 'bg-amber-500/30 scale-110'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  {energyLabels[n - 1]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mood */}
          <div>
            <p className="text-sm text-zinc-500 mb-2">Mood</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setMood(n)}
                  className={`flex-1 py-3 rounded-lg text-xl transition-all ${
                    mood === n
                      ? 'bg-cyan-500/30 scale-110'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  {moodLabels[n - 1]}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Quick note (optional)"
            className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={logEnergy}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium rounded-lg transition-colors"
          >
            Log
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 cascade-card p-6">
          <h3 className="text-lg font-medium text-zinc-200 mb-4">7-Day Trend</h3>
          
          <div className="h-48 flex items-end gap-2">
            {last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 justify-center" style={{ height: '140px' }}>
                  {/* Energy bar */}
                  <div className="w-3 bg-zinc-800 rounded-t relative">
                    <div 
                      className="absolute bottom-0 w-full bg-amber-500 rounded-t transition-all"
                      style={{ height: `${(day.energy / 5) * 100}%` }}
                    />
                  </div>
                  {/* Mood bar */}
                  <div className="w-3 bg-zinc-800 rounded-t relative">
                    <div 
                      className="absolute bottom-0 w-full bg-cyan-500 rounded-t transition-all"
                      style={{ height: `${(day.mood / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-zinc-500">{day.date}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded" />
              <span className="text-zinc-400">Energy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded" />
              <span className="text-zinc-400">Mood</span>
            </div>
          </div>
        </div>
        
        {/* Today's Stats */}
        <div className="space-y-4">
          <div className="cascade-card p-6 text-center">
            <p className="text-sm text-zinc-500 mb-2">Today's Average Energy</p>
            <p className="text-4xl mb-2">{energyLabels[Math.round(avgEnergy) - 1] || '—'}</p>
            <p className="text-2xl font-bold text-amber-400">{avgEnergy.toFixed(1)}/5</p>
          </div>
          
          <div className="cascade-card p-6 text-center">
            <p className="text-sm text-zinc-500 mb-2">Today's Average Mood</p>
            <p className="text-4xl mb-2">{moodLabels[Math.round(avgMood) - 1] || '—'}</p>
            <p className="text-2xl font-bold text-cyan-400">{avgMood.toFixed(1)}/5</p>
          </div>
          
          <div className="cascade-card p-6 text-center">
            <p className="text-sm text-zinc-500 mb-2">Logs Today</p>
            <p className="text-2xl font-bold text-purple-400">{todayLogs.length}</p>
          </div>
        </div>
      </div>
      
      {/* Recent Logs */}
      <div className="mt-8 cascade-card p-6">
        <h3 className="text-lg font-medium text-zinc-200 mb-4">Recent Logs</h3>
        
        {logs.length === 0 ? (
          <p className="text-zinc-500 text-center py-4">No logs yet. Start tracking!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.slice(0, 20).map(log => (
              <div key={log.id} className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-lg">
                <span className="text-xl">{energyLabels[log.energy - 1]}</span>
                <span className="text-xl">{moodLabels[log.mood - 1]}</span>
                <span className="flex-1 text-sm text-zinc-400">{log.note || '—'}</span>
                <span className="text-xs text-zinc-600">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Philosophy */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-amber-500/5 to-cyan-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">Why Track?</h3>
        <p className="text-sm text-zinc-400">
          Energy and mood are the substrate of action. High intent (I) requires energy. 
          Drift (D) increases when mood is low. By tracking these, you gain insight 
          into when to push and when to rest. The system serves sovereignty — 
          not productivity at the cost of wellbeing.
        </p>
      </div>
    </div>
  )
}
