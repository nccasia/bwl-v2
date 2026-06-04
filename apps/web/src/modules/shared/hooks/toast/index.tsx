'use client'
import { toast } from '@heroui/react'

interface ToastOptions {
  description?: string
  timeout?: number
  dismissible?: boolean
  onClose?: () => void
}

export function useToast() {
  return {
    success: (message: string, options?: ToastOptions) => {
      toast.success(message, {
        description: options?.description,
        timeout: options?.timeout,
        onClose: options?.onClose,
      })
    },
    error: (message: string, options?: ToastOptions) => {
      toast.danger(message, {
        description: options?.description,
        timeout: options?.timeout,
        onClose: options?.onClose,
      })
    },
    warning: (message: string, options?: ToastOptions) => {
      toast.warning(message, {
        description: options?.description,
        timeout: options?.timeout,
        onClose: options?.onClose,
      })
    },
    info: (message: string, options?: ToastOptions) => {
      toast.info(message, {
        description: options?.description,
        timeout: options?.timeout,
        onClose: options?.onClose,
      })
    },
  }
}
