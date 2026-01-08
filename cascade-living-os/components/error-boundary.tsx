'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CASCADE Error:', error, errorInfo)
    
    // Log to localStorage for debugging
    if (typeof window !== 'undefined') {
      const errors = JSON.parse(localStorage.getItem('cascade-errors') || '[]')
      errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        componentStack: errorInfo.componentStack
      })
      // Keep only last 10 errors
      localStorage.setItem('cascade-errors', JSON.stringify(errors.slice(-10)))
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="cascade-card p-8 max-w-md text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-zinc-200 mb-2">Something went wrong</h2>
            <p className="text-sm text-zinc-500 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
            <p className="text-xs text-zinc-600 mt-4 font-mono">
              The invariant holds. ε {'>'} 0
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to throw to error boundary
export function useErrorHandler() {
  const [, setError] = React.useState()
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}
