'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

interface WeeklyReview {
  id: string
  weekStart: string // ISO date string
  weekEnd: string
  completedAt?: number
  
  // Reflection sections
  wins: string[]
  challenges: string[]
  lessons: string[]
  gratitude: string[]
  
  // Metrics snapshot
  microorcimsFired: number
  focusHours: number
  ritualsCompleted: number
  goalsProgressed: number
  
  // Ratings
  overallRating: 1 | 2 | 3 | 4 | 5
  energyLevel: 1 | 2 | 3 | 4 | 5
  alignmentScore: 1 | 2 | 3 | 4 | 5
  
  // Planning
  nextWeekIntentions: string[]
  focusAreas: string[]
  
  // Notes
  notes: string
  lamague: string
}

// ============================================================================
// REVIEW SECTION COMPONENT
// ============================================================================

function ReviewSection({
  title,
  icon,
  items,
  onAdd,
  onRemove,
  placeholder,
  color
}: {
  title: string
  icon: string
  items: string[]
  onAdd: (item: string) => void
  onRemove: (index: number) => void
  placeholder: string
  color: string
}) {
  const [newItem, setNewItem] = useState('')
  
  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim())
      setNewItem('')
    }
  }
  
  return (
    <div className="cascade-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-medium text-zinc-200">{title}</h3>
        <span className="text-xs text-zinc-500">({items.length})</span>
      </div>
      
      <div className="space-y-2 mb-3">
        {items.map((item, i) => (
          <div key={i} className={`flex items-start gap-2 p-2 bg-${color}-500/10 rounded`}>
            <span className={`text-${color}-400 mt-0.5`}>•</span>
            <span className="flex-1 text-sm text-zinc-300">{item}</span>
            <button
              onClick={() => onRemove(i)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleAdd}
          disabled={!newItem.trim()}
          className={`px-3 py-1.5 bg-${color}-500/20 text-${color}-400 rounded text-sm hover:bg-${color}-500/30 transition-colors disabled:opacity-50`}
        >
          Add
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// RATING SELECTOR
// ============================================================================

function RatingSelector({
  label,
  value,
  onChange
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-2">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded text-sm transition-colors ${
              value >= n
                ? n >= 4 ? 'bg-emerald-500/30 text-emerald-300' :
                  n === 3 ? 'bg-cyan-500/30 text-cyan-300' :
                  'bg-amber-500/30 text-amber-300'
                : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ReviewPage() {
  const [reviews, setReviews] = useState<WeeklyReview[]>([])
  const [currentReview, setCurrentReview] = useState<WeeklyReview | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  
  // Get current week boundaries
  const getWeekBoundaries = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    }
  }
  
  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cascade-weekly-reviews')
      if (saved) {
        const parsed = JSON.parse(saved)
        setReviews(parsed)
        
        // Check if current week has a review
        const { start } = getWeekBoundaries()
        const existing = parsed.find((r: WeeklyReview) => r.weekStart === start)
        if (existing) {
          setCurrentReview(existing)
        }
      }
    }
  }, [])
  
  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cascade-weekly-reviews', JSON.stringify(reviews))
    }
  }, [reviews])
  
  // Initialize new review
  const startNewReview = () => {
    const { start, end } = getWeekBoundaries()
    
    const newReview: WeeklyReview = {
      id: `review-${Date.now()}`,
      weekStart: start,
      weekEnd: end,
      wins: [],
      challenges: [],
      lessons: [],
      gratitude: [],
      microorcimsFired: 0,
      focusHours: 0,
      ritualsCompleted: 0,
      goalsProgressed: 0,
      overallRating: 3,
      energyLevel: 3,
      alignmentScore: 3,
      nextWeekIntentions: [],
      focusAreas: [],
      notes: '',
      lamague: '⟲'
    }
    
    setCurrentReview(newReview)
    setReviews(prev => [...prev.filter(r => r.weekStart !== start), newReview])
  }
  
  // Update current review
  const updateReview = (updates: Partial<WeeklyReview>) => {
    if (!currentReview) return
    
    const updated = { ...currentReview, ...updates }
    setCurrentReview(updated)
    setReviews(prev => prev.map(r => r.id === updated.id ? updated : r))
  }
  
  // Complete review
  const completeReview = () => {
    if (!currentReview) return
    
    const completed = { ...currentReview, completedAt: Date.now() }
    setCurrentReview(completed)
    setReviews(prev => prev.map(r => r.id === completed.id ? completed : r))
  }
  
  // Check if we have a review for this week
  const { start } = getWeekBoundaries()
  const hasCurrentWeekReview = reviews.some(r => r.weekStart === start)
  
  if (showHistory) {
    return (
      <div className="p-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-100 mb-2">Review History</h1>
              <p className="text-zinc-500">Past weekly reflections</p>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        </header>
        
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="cascade-card p-8 text-center">
              <p className="text-zinc-500">No reviews yet</p>
            </div>
          ) : (
            reviews.slice().reverse().map(review => (
              <div 
                key={review.id}
                className={`cascade-card p-4 cursor-pointer hover:border-cyan-500/30 transition-all ${
                  review.completedAt ? 'border-emerald-500/20' : 'border-amber-500/20'
                }`}
                onClick={() => {
                  setCurrentReview(review)
                  setShowHistory(false)
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-mono text-purple-400">{review.lamague}</span>
                    <div>
                      <p className="font-medium text-zinc-200">
                        Week of {new Date(review.weekStart).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {review.completedAt ? 'Completed' : 'In progress'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-cyan-400">{review.microorcimsFired} μ</span>
                    <span className="text-emerald-400">{review.wins.length} wins</span>
                    <span className={`font-bold ${
                      review.overallRating >= 4 ? 'text-emerald-400' :
                      review.overallRating === 3 ? 'text-cyan-400' :
                      'text-amber-400'
                    }`}>
                      {review.overallRating}/5
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Weekly Review</h1>
            <p className="text-zinc-500">
              {currentReview 
                ? `Week of ${new Date(currentReview.weekStart).toLocaleDateString()}`
                : 'Reflect on your week'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              History ({reviews.length})
            </button>
            {!currentReview && (
              <button
                onClick={startNewReview}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium rounded-lg transition-colors"
              >
                Start Review
              </button>
            )}
          </div>
        </div>
      </header>
      
      {!currentReview ? (
        <div className="cascade-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <span className="text-3xl font-mono text-purple-400">⟲</span>
          </div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2">Time for Reflection</h3>
          <p className="text-sm text-zinc-500 mb-4">
            The weekly review closes the loop. It transforms experience into wisdom.
          </p>
          <button
            onClick={startNewReview}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium rounded-lg transition-colors"
          >
            Begin This Week's Review
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Reflection Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReviewSection
              title="Wins"
              icon="🏆"
              items={currentReview.wins}
              onAdd={(item) => updateReview({ wins: [...currentReview.wins, item] })}
              onRemove={(i) => updateReview({ wins: currentReview.wins.filter((_, j) => j !== i) })}
              placeholder="What went well?"
              color="emerald"
            />
            
            <ReviewSection
              title="Challenges"
              icon="🔥"
              items={currentReview.challenges}
              onAdd={(item) => updateReview({ challenges: [...currentReview.challenges, item] })}
              onRemove={(i) => updateReview({ challenges: currentReview.challenges.filter((_, j) => j !== i) })}
              placeholder="What was difficult?"
              color="amber"
            />
            
            <ReviewSection
              title="Lessons"
              icon="💡"
              items={currentReview.lessons}
              onAdd={(item) => updateReview({ lessons: [...currentReview.lessons, item] })}
              onRemove={(i) => updateReview({ lessons: currentReview.lessons.filter((_, j) => j !== i) })}
              placeholder="What did you learn?"
              color="cyan"
            />
            
            <ReviewSection
              title="Gratitude"
              icon="🙏"
              items={currentReview.gratitude}
              onAdd={(item) => updateReview({ gratitude: [...currentReview.gratitude, item] })}
              onRemove={(i) => updateReview({ gratitude: currentReview.gratitude.filter((_, j) => j !== i) })}
              placeholder="What are you grateful for?"
              color="pink"
            />
          </div>
          
          {/* Ratings */}
          <div className="cascade-card p-6">
            <h3 className="font-medium text-zinc-200 mb-4">Week Ratings</h3>
            <div className="grid grid-cols-3 gap-6">
              <RatingSelector
                label="Overall Week"
                value={currentReview.overallRating}
                onChange={(v) => updateReview({ overallRating: v as 1|2|3|4|5 })}
              />
              <RatingSelector
                label="Energy Level"
                value={currentReview.energyLevel}
                onChange={(v) => updateReview({ energyLevel: v as 1|2|3|4|5 })}
              />
              <RatingSelector
                label="Value Alignment"
                value={currentReview.alignmentScore}
                onChange={(v) => updateReview({ alignmentScore: v as 1|2|3|4|5 })}
              />
            </div>
          </div>
          
          {/* Next Week Planning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReviewSection
              title="Next Week Intentions"
              icon="🎯"
              items={currentReview.nextWeekIntentions}
              onAdd={(item) => updateReview({ nextWeekIntentions: [...currentReview.nextWeekIntentions, item] })}
              onRemove={(i) => updateReview({ nextWeekIntentions: currentReview.nextWeekIntentions.filter((_, j) => j !== i) })}
              placeholder="What will you focus on?"
              color="purple"
            />
            
            <ReviewSection
              title="Focus Areas"
              icon="🔍"
              items={currentReview.focusAreas}
              onAdd={(item) => updateReview({ focusAreas: [...currentReview.focusAreas, item] })}
              onRemove={(i) => updateReview({ focusAreas: currentReview.focusAreas.filter((_, j) => j !== i) })}
              placeholder="Where to direct energy?"
              color="cyan"
            />
          </div>
          
          {/* Notes */}
          <div className="cascade-card p-4">
            <h3 className="font-medium text-zinc-200 mb-3">Additional Notes</h3>
            <textarea
              value={currentReview.notes}
              onChange={(e) => updateReview({ notes: e.target.value })}
              placeholder="Any other reflections..."
              rows={4}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
          
          {/* Complete Button */}
          {!currentReview.completedAt && (
            <div className="flex justify-center">
              <button
                onClick={completeReview}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-zinc-900 font-medium rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all"
              >
                Complete Review ⟲
              </button>
            </div>
          )}
          
          {currentReview.completedAt && (
            <div className="cascade-card p-4 bg-emerald-500/10 border-emerald-500/20 text-center">
              <p className="text-emerald-400">
                ✓ Review completed on {new Date(currentReview.completedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
