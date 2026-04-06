'use client'

import { Toast } from '@heroui/react'
import { QueryProvider } from './query-provider'
import { AuthSync } from './auth-sync'
import { Suspense } from 'react'
import { useLoginToast } from '@/modules/shared/hooks/auth/use-login-toast'

function ToastManager() {
  useLoginToast();
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthSync />
      <Toast.Provider placement="top"/>
      <Suspense fallback={null}>
        <ToastManager />
      </Suspense>
      {children}
    </QueryProvider>
  )
}

