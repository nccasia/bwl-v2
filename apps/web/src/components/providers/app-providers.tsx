'use client'

import { Toast } from '@heroui/react'
import { QueryProvider } from './query-provider'
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Toast.Provider placement="top"/>
      {children}
    </QueryProvider>
  )
}
