"use client"

import { Suspense } from "react"
import { LoginContent } from "../components/login-content"

export function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-black" />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4">
             <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin shadow-2xl" />
             <p className="text-white font-medium animate-pulse drop-shadow-md">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
