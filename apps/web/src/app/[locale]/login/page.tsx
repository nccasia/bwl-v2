"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Image from "next/image"
import { saveUser } from "@/hooks/useAuth"

const BE_URL = process.env.NEXT_PUBLIC_API_URL

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const error = searchParams.get("error")
  const sub = searchParams.get("sub")
  const accessToken = searchParams.get("accessToken")

  useEffect(() => {
    if (sub && accessToken) {
      router.replace(`/loading?${searchParams.toString()}`)
    }
  }, [sub, accessToken, searchParams, router])

  if (sub && accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-start justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/img/bg_login.jpg"
          alt="Login Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="relative z-10 w-full max-w-md mt-10">
        <Card className="w-full border-0 bg-white/85 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pt-6 pb-2">
            <CardTitle className="text-center text-2xl font-bold tracking-tight text-gray-900">
              Welcome to BWL
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-6">
            {error && (
              <Alert variant="destructive" className="bg-destructive/15 border-destructive/30 text-destructive-foreground animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-bold">Error</AlertTitle>
                <AlertDescription className="text-sm">
                  {decodeURIComponent(error)}
                </AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full h-auto py-3 px-6 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 rounded-2xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() =>
                (window.location.href = `${BE_URL}/auth/mezon`)
              }
            >
              <div className="flex items-center justify-center gap-3">
                <div className="relative w-7 h-7 shrink-0">
                  <Image
                    src="/assets/img/mezon-logo.webp"
                    alt="Mezon Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-semibold">Login with Mezon</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
