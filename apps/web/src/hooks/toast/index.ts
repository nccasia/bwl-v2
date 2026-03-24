'use client'

import { ToastContext } from '@/providers/toast-provider'
import { useContext } from 'react'

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context.toast
}
