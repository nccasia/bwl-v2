'use client'
import { toast } from '@heroui/react'
import { X } from 'lucide-react'

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
        actionProps: {
          children: <X/>,
          onPress: () => toast.clear(),
          variant: "tertiary",
          size: "sm",
          isIconOnly: true,
        },
        description: options?.description,
        timeout: options?.timeout,
        onClose: options?.onClose,
      })
    },
    error: (message: string, options?: ToastOptions) => {
      toast.danger(message, {
        actionProps: {
          children: <X/>,
          onPress: () => toast.clear(),
          variant: "tertiary",
          size: "sm",
          isIconOnly: true,
        },
        description: options?.description,
        timeout: options?.timeout,
        onClose: options?.onClose,
      })
    },
    warning: (message: string, options?: ToastOptions) => {
      toast.warning(message, {
        actionProps: {
          children: <X/>,
          onPress: () => toast.clear(),
          variant: "tertiary",
          size: "sm",
          isIconOnly: true,
        },
        description: options?.description,
        timeout: options?.timeout,
        onClose: options?.onClose,
      })
    },
    info: (message: string, options?: ToastOptions) => {
      toast.info(message, {
        actionProps: {
          children: <X/>,
          onPress: () => toast.clear(),
          variant: "tertiary",
          size: "sm",
          isIconOnly: true,
        },
        description: options?.description,
        timeout: options?.timeout,
        onClose: options?.onClose,
      })
    },
  }
}
