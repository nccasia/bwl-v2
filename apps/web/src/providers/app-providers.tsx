'use client'

import { Toast } from '@heroui/react'
import { QueryProvider } from './query-provider'
import { AuthSync } from './auth-sync'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthSync />
      <Toast.Provider placement="top"/>
      {children}
    </QueryProvider>
  )
}
