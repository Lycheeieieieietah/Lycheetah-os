// CASCADE Living OS - Skeleton Loaders
// Reusable loading state components

import React from 'react'

// ============================================================================
// BASE SKELETON
// ============================================================================

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded ${className}`} />
  )
}

// ============================================================================
// PRESET SKELETONS
// ============================================================================

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`cascade-card p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}

export function SkeletonWidget({ className = '' }: SkeletonProps) {
  return (
    <div className={`cascade-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-12 w-24 mb-4" />
      <div className="space-y-3">
        <div>
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div>
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-1.5 w-3/4 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 cascade-card">
          <Skeleton className="w-8 h-8 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-12 rounded" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`cascade-card overflow-hidden ${className}`}>
      <div className="grid gap-4 p-4 border-b border-zinc-800" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex}
          className="grid gap-4 p-4 border-b border-zinc-800 last:border-0" 
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart({ className = '' }: SkeletonProps) {
  return (
    <div className={`cascade-card p-6 ${className}`}>
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats({ className = '' }: SkeletonProps) {
  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="cascade-card p-4 text-center">
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// PAGE SKELETONS
// ============================================================================

export function SkeletonPageHeader({ className = '' }: SkeletonProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="p-8">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonWidget className="lg:col-span-2" />
        <SkeletonWidget />
        <SkeletonWidget />
        <SkeletonWidget />
        <SkeletonWidget />
      </div>
    </div>
  )
}

export function SkeletonListPage() {
  return (
    <div className="p-8">
      <SkeletonPageHeader />
      <SkeletonStats className="mb-8" />
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
      <SkeletonList items={6} />
    </div>
  )
}

// ============================================================================
// LOADING SPINNER
// ============================================================================

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
        <circle 
          className="opacity-25" 
          cx="12" cy="12" r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-zinc-950/80 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="text-cyan-400 mx-auto mb-4" />
        <p className="text-zinc-400">{message}</p>
      </div>
    </div>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="cascade-card p-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-zinc-200 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 mb-4 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
