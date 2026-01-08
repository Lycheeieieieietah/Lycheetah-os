// CASCADE Living OS - Utility Functions
// Common calculations and helpers

// ============================================================================
// DATE UTILITIES
// ============================================================================

export function formatDate(timestamp: number, format: 'short' | 'long' | 'relative' = 'short'): string {
  const date = new Date(timestamp)
  const now = new Date()
  
  if (format === 'relative') {
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // short
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isYesterday(timestamp: number): boolean {
  const date = new Date(timestamp)
  const yesterday = new Date(Date.now() - 86400000)
  return date.toDateString() === yesterday.toDateString()
}

export function getDateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0]
}

export function getDaysBetween(start: number, end: number): number {
  return Math.floor((end - start) / (1000 * 60 * 60 * 24))
}

// ============================================================================
// STREAK CALCULATIONS
// ============================================================================

export interface StreakResult {
  current: number
  longest: number
  lastActive: number | null
  isActiveToday: boolean
}

export function calculateStreak(timestamps: number[]): StreakResult {
  if (timestamps.length === 0) {
    return { current: 0, longest: 0, lastActive: null, isActiveToday: false }
  }
  
  // Sort descending (newest first)
  const sorted = [...timestamps].sort((a, b) => b - a)
  
  // Get unique days
  const days = new Set(sorted.map(t => getDateKey(t)))
  const dayArray = Array.from(days).sort().reverse()
  
  const today = getDateKey(Date.now())
  const yesterday = getDateKey(Date.now() - 86400000)
  
  const isActiveToday = dayArray[0] === today
  const lastActive = sorted[0]
  
  // Count current streak
  let current = 0
  let checkDate = isActiveToday ? today : yesterday
  
  // If most recent activity is older than yesterday, streak is 0
  if (dayArray[0] !== today && dayArray[0] !== yesterday) {
    current = 0
  } else {
    for (const day of dayArray) {
      if (day === checkDate) {
        current++
        // Move to previous day
        const d = new Date(checkDate)
        d.setDate(d.getDate() - 1)
        checkDate = getDateKey(d.getTime())
      } else {
        break
      }
    }
  }
  
  // Calculate longest streak
  let longest = 0
  let tempStreak = 1
  const sortedAsc = dayArray.slice().reverse()
  
  for (let i = 1; i < sortedAsc.length; i++) {
    const prevDate = new Date(sortedAsc[i - 1])
    const currDate = new Date(sortedAsc[i])
    const diffDays = getDaysBetween(prevDate.getTime(), currDate.getTime())
    
    if (diffDays === 1) {
      tempStreak++
    } else {
      longest = Math.max(longest, tempStreak)
      tempStreak = 1
    }
  }
  longest = Math.max(longest, tempStreak)
  
  return { current, longest, lastActive, isActiveToday }
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

export function formatNumber(num: number, decimals: number = 0): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toFixed(decimals)
}

export function formatPercent(value: number, decimals: number = 0): string {
  return (value * 100).toFixed(decimals) + '%'
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}m`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item)
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], keyFn: (item: T) => number, desc: boolean = false): T[] {
  return [...array].sort((a, b) => {
    const diff = keyFn(a) - keyFn(b)
    return desc ? -diff : diff
  })
}

export function uniqueBy<T>(array: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>()
  return array.filter(item => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ============================================================================
// SOVEREIGNTY CALCULATIONS
// ============================================================================

export function calculateSovereigntyScore(params: {
  drift: number        // 0-1, lower is better
  coherence: number    // 0-1, higher is better
  alignment: number    // 0-1, higher is better
}): number {
  const { drift, coherence, alignment } = params
  // S = (1 - drift) × coherence × alignment
  return (1 - drift) * coherence * alignment
}

export function getSovereigntyLabel(score: number): {
  label: string
  color: string
  description: string
} {
  if (score >= 0.8) {
    return {
      label: 'SOVEREIGN',
      color: 'text-emerald-400',
      description: 'Fully aligned with your invariant'
    }
  }
  if (score >= 0.6) {
    return {
      label: 'STABLE',
      color: 'text-cyan-400',
      description: 'Minor drift detected, staying course'
    }
  }
  if (score >= 0.4) {
    return {
      label: 'DRIFTING',
      color: 'text-amber-400',
      description: 'Significant drift, attention needed'
    }
  }
  return {
    label: 'CRITICAL',
    color: 'text-red-400',
    description: 'Major misalignment detected'
  }
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

export function safeLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

export function saveToLocalStorage(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// ============================================================================
// ID GENERATION
// ============================================================================

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`
}

// ============================================================================
// VALIDATION
// ============================================================================

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ============================================================================
// DEBOUNCE / THROTTLE
// ============================================================================

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ============================================================================
// COLORS FOR CHARTS
// ============================================================================

export const CHART_COLORS = {
  cyan: 'rgb(6, 182, 212)',
  purple: 'rgb(168, 85, 247)',
  amber: 'rgb(245, 158, 11)',
  emerald: 'rgb(16, 185, 129)',
  pink: 'rgb(236, 72, 153)',
  blue: 'rgb(59, 130, 246)',
  red: 'rgb(239, 68, 68)',
  zinc: 'rgb(161, 161, 170)'
}

export const CHART_COLORS_ALPHA = {
  cyan: 'rgba(6, 182, 212, 0.2)',
  purple: 'rgba(168, 85, 247, 0.2)',
  amber: 'rgba(245, 158, 11, 0.2)',
  emerald: 'rgba(16, 185, 129, 0.2)',
  pink: 'rgba(236, 72, 153, 0.2)',
  blue: 'rgba(59, 130, 246, 0.2)',
  red: 'rgba(239, 68, 68, 0.2)',
  zinc: 'rgba(161, 161, 170, 0.2)'
}
