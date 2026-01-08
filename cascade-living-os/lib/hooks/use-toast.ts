'use client'

import { useCallback } from 'react'
import { useNotifications, NotificationType } from '@/components/notifications'

// ============================================================================
// TOAST HOOK
// ============================================================================

interface ToastOptions {
  title: string
  message?: string
  type?: NotificationType
  duration?: number
}

export function useToast() {
  const { addNotification } = useNotifications()
  
  const toast = useCallback((options: ToastOptions) => {
    addNotification({
      title: options.title,
      message: options.message || '',
      type: options.type || 'info',
      duration: options.duration || 3000
    })
  }, [addNotification])
  
  const success = useCallback((title: string, message?: string) => {
    toast({ title, message, type: 'success' })
  }, [toast])
  
  const error = useCallback((title: string, message?: string) => {
    toast({ title, message, type: 'error', duration: 5000 })
  }, [toast])
  
  const warning = useCallback((title: string, message?: string) => {
    toast({ title, message, type: 'warning' })
  }, [toast])
  
  const info = useCallback((title: string, message?: string) => {
    toast({ title, message, type: 'info' })
  }, [toast])
  
  const insight = useCallback((title: string, message?: string) => {
    toast({ title, message, type: 'insight', duration: 5000 })
  }, [toast])
  
  const microorcim = useCallback((title: string, message?: string) => {
    toast({ title, message, type: 'microorcim' })
  }, [toast])
  
  const phase = useCallback((title: string, message?: string) => {
    toast({ title, message, type: 'phase', duration: 5000 })
  }, [toast])
  
  return {
    toast,
    success,
    error,
    warning,
    info,
    insight,
    microorcim,
    phase
  }
}

// ============================================================================
// CONFIRMATION DIALOG HOOK
// ============================================================================

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export function useConfirm() {
  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      // For now, use native confirm
      // In future, this could be a custom modal
      const result = window.confirm(`${options.title}\n\n${options.message}`)
      resolve(result)
    })
  }, [])
  
  return confirm
}

// ============================================================================
// PROMPT DIALOG HOOK
// ============================================================================

interface PromptOptions {
  title: string
  message?: string
  defaultValue?: string
  placeholder?: string
}

export function usePrompt() {
  const prompt = useCallback((options: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      // For now, use native prompt
      // In future, this could be a custom modal
      const result = window.prompt(
        options.message ? `${options.title}\n\n${options.message}` : options.title,
        options.defaultValue || ''
      )
      resolve(result)
    })
  }, [])
  
  return prompt
}
