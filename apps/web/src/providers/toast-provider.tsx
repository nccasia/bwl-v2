'use client'

import { Toast } from '@heroui/react'
import { createContext, ReactNode } from 'react'

interface ToastContextType {
  toast: {
    success: (message: string, options?: object) => void
    error: (message: string, options?: object) => void
    warning: (message: string, options?: object) => void
    info: (message: string, options?: object) => void
    promise: <T>(
      promise: Promise<T>,
      options: {
        loading?: string
        success?: string | ((data: T) => string)
        error?: string | ((error: unknown) => string)
      }
    ) => void
  }
}

// Provider props
interface ToastProviderProps {
  children: ReactNode
  maxVisibleToasts?: number
  placement?: 'bottom' | 'bottom end' | 'bottom start' | 'top' | 'top end' | 'top start'
}

// Create context
export const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast Provider component
export function ToastProvider({
  children,
  maxVisibleToasts = 5,
  placement = 'top end',
}: ToastProviderProps) {
  const contextValue: ToastContextType = {
    toast: {
      success: (message: string, options?: object) => {
        Toast.toast.success(message, { timeout: 4000, ...options })
      },
      error: (message: string, options?: object) => {
        Toast.toast.danger(message, { timeout: 6000, ...options })
      },
      warning: (message: string, options?: object) => {
        Toast.toast.warning(message, { timeout: 5000, ...options })
      },
      info: (message: string, options?: object) => {
        Toast.toast.info(message, { timeout: 4000, ...options })
      },
      promise: <T,>(
        promise: Promise<T>,
        options: {
          loading?: string
          success?: string | ((data: T) => string)
          error?: string | ((error: unknown) => string)
        }
      ) => {
        Toast.toast.promise(promise, {
          loading: options.loading || 'Loading...',
          success: (data: T) => {
            const msg = typeof options.success === 'function' 
              ? options.success(data) 
              : options.success || 'Success!'
            return typeof msg === 'string' ? msg : 'Success!'
          },
          error: (err: Error) => {
            const msg = typeof options.error === 'function' 
              ? options.error(err) 
              : options.error || 'An error occurred'
            return typeof msg === 'string' ? msg : 'Error!'
          },
        })
      },
    },
  }

  return (
    <ToastContext.Provider value={contextValue}>
      <Toast.Provider maxVisibleToasts={maxVisibleToasts} placement={placement}>
        {children}
      </Toast.Provider>
    </ToastContext.Provider>
  )
}
