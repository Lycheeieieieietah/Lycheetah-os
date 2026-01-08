'use client'

import { useState, useEffect } from 'react'
import { exportCascadeData, importCascadeData } from '@/lib/hooks/use-cascade-data'

// ============================================================================
// TYPES
// ============================================================================

interface BackupInfo {
  key: string
  label: string
  count: number
  size: number
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  
  const storageKeys = [
    { key: 'cascade-microorcims', label: 'Microorcims' },
    { key: 'cascade-focus-sessions', label: 'Focus Sessions' },
    { key: 'cascade-journal', label: 'Journal Entries' },
    { key: 'cascade-rituals', label: 'Rituals' },
    { key: 'cascade-goals', label: 'Goals' },
    { key: 'cascade-commitments', label: 'Commitments' },
    { key: 'cascade-values', label: 'Values' },
    { key: 'cascade-quick-captures', label: 'Quick Captures' },
    { key: 'cascade-energy-logs', label: 'Energy Logs' },
    { key: 'cascade-memories', label: 'Memories' },
    { key: 'cascade-weekly-reviews', label: 'Weekly Reviews' },
    { key: 'cascade-connections', label: 'Connections' },
    { key: 'cascade-decisions', label: 'Decisions' },
    { key: 'cascade-projections', label: 'Projections' },
    { key: 'cascade-breath-sessions', label: 'Breath Sessions' },
    { key: 'cascade-llm-config', label: 'LLM Config' }
  ]
  
  // Load backup info
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const info: BackupInfo[] = storageKeys.map(({ key, label }) => {
      const data = localStorage.getItem(key)
      let count = 0
      let size = 0
      
      if (data) {
        size = new Blob([data]).size
        try {
          const parsed = JSON.parse(data)
          count = Array.isArray(parsed) ? parsed.length : 1
        } catch {
          count = 1
        }
      }
      
      return { key, label, count, size }
    })
    
    setBackups(info)
    
    // Check last backup
    const last = localStorage.getItem('cascade-last-backup')
    if (last) setLastBackup(last)
  }, [])
  
  const handleExport = () => {
    const data = exportCascadeData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cascade-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    // Save timestamp
    const now = new Date().toISOString()
    localStorage.setItem('cascade-last-backup', now)
    setLastBackup(now)
    setMessage({ type: 'success', text: 'Backup downloaded successfully!' })
    setTimeout(() => setMessage(null), 3000)
  }
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImporting(true)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const success = importCascadeData(content)
        
        if (success) {
          setMessage({ type: 'success', text: 'Data imported successfully! Refreshing...' })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: 'error', text: 'Import failed. Invalid file format.' })
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Import failed. Could not parse file.' })
      } finally {
        setImporting(false)
      }
    }
    
    reader.readAsText(file)
    e.target.value = '' // Reset input
  }
  
  const handleClearAll = () => {
    if (!confirm('Are you sure you want to clear ALL CASCADE data? This cannot be undone.')) return
    if (!confirm('Really sure? Type "DELETE" in the next prompt to confirm.')) return
    
    const confirmation = prompt('Type DELETE to confirm:')
    if (confirmation !== 'DELETE') {
      setMessage({ type: 'error', text: 'Cancelled. Data not deleted.' })
      return
    }
    
    storageKeys.forEach(({ key }) => localStorage.removeItem(key))
    localStorage.removeItem('cascade-last-backup')
    
    setMessage({ type: 'success', text: 'All data cleared. Refreshing...' })
    setTimeout(() => window.location.reload(), 1500)
  }
  
  const totalSize = backups.reduce((sum, b) => sum + b.size, 0)
  const totalItems = backups.reduce((sum, b) => sum + b.count, 0)
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Backup & Export</h1>
        <p className="text-zinc-500">Manage your CASCADE data</p>
      </header>
      
      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{totalItems}</p>
          <p className="text-xs text-zinc-500">Total Items</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{formatSize(totalSize)}</p>
          <p className="text-xs text-zinc-500">Total Size</p>
        </div>
        <div className="cascade-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">
            {lastBackup ? new Date(lastBackup).toLocaleDateString() : 'Never'}
          </p>
          <p className="text-xs text-zinc-500">Last Backup</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={handleExport}
          className="cascade-card p-6 hover:border-cyan-500/30 transition-all text-left"
        >
          <span className="text-3xl mb-3 block">📤</span>
          <h3 className="text-lg font-medium text-zinc-200 mb-1">Export Backup</h3>
          <p className="text-sm text-zinc-500">Download all your CASCADE data as JSON</p>
        </button>
        
        <label className="cascade-card p-6 hover:border-purple-500/30 transition-all text-left cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            disabled={importing}
          />
          <span className="text-3xl mb-3 block">📥</span>
          <h3 className="text-lg font-medium text-zinc-200 mb-1">
            {importing ? 'Importing...' : 'Import Backup'}
          </h3>
          <p className="text-sm text-zinc-500">Restore from a previous backup file</p>
        </label>
      </div>
      
      {/* Data Breakdown */}
      <div className="cascade-card p-6 mb-8">
        <h3 className="text-lg font-medium text-zinc-200 mb-4">Data Breakdown</h3>
        <div className="space-y-2">
          {backups.filter(b => b.count > 0).map(backup => (
            <div key={backup.key} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded">
              <span className="flex-1 text-sm text-zinc-300">{backup.label}</span>
              <span className="text-sm text-cyan-400 font-mono">{backup.count}</span>
              <span className="text-xs text-zinc-600 w-20 text-right">{formatSize(backup.size)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="cascade-card p-6 border-red-500/20">
        <h3 className="text-lg font-medium text-red-400 mb-4">⚠️ Danger Zone</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Clear all CASCADE data from this browser. This action cannot be undone.
          Make sure to export a backup first.
        </p>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Clear All Data
        </button>
      </div>
      
      {/* Tips */}
      <div className="mt-8 cascade-card p-6 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">💡 Backup Tips</h3>
        <ul className="text-sm text-zinc-400 space-y-2">
          <li>• Export backups regularly (weekly recommended)</li>
          <li>• Store backups in multiple locations (cloud, local)</li>
          <li>• Backup files are JSON and can be inspected/edited</li>
          <li>• Import merges with existing data (doesn't replace)</li>
        </ul>
      </div>
    </div>
  )
}
