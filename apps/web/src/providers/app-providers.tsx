'use client'

import { Toast } from '@heroui/react'
import { QueryProvider } from './query-provider'
import { AuthSync } from './auth-sync'
import { Suspense } from 'react'
import { useLoginToast } from '@/modules/shared/hooks/auth/use-login-toast'
import { ThemeProvider } from './theme-provider'

function ToastManager() {
  useLoginToast();
  return null;
}

import { ImageViewer } from '@/modules/shared/components/common/image-viewer'
import { LoginRequiredDialog } from '@/modules/shared/components/common/login-required-dialog'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthSync />
        <Toast.Provider placement="top"/>
        <Suspense fallback={null}>
          <ToastManager />
        </Suspense>
        {children}
        <ImageViewer />
        <LoginRequiredDialog />
      </QueryProvider>
    </ThemeProvider>
  )
}

