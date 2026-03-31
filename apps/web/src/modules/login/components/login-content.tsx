"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import Image from "next/image"
import * as v from "valibot"
import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { useAuthStore } from "@/stores/login/auth-store"

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/components/common/card"
import { Alert, AlertTitle, AlertDescription } from "@/modules/shared/components/common/alert"
import { loginParamsSchema } from "@/schemas/login"
import { MezonLoginButton } from "./mezon-login-button"

export function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const setSession = useAuthStore((state) => state.setSession)
  const handledRef = useRef(false)

  const paramsRaw = Object.fromEntries(searchParams.entries())
  const result = v.safeParse(loginParamsSchema, paramsRaw)
  
  const { sub, accessToken, error } = result.success ? result.output : { sub: undefined, accessToken: undefined, error: undefined }
  const isRedirecting = !!(sub && accessToken)

  useEffect(() => {
    if (!sub || !accessToken || handledRef.current) return

    const handleLogin = async () => {
      handledRef.current = true
      
      try {
        const mockUser = { id: sub, username: `user_${sub}` }
        setSession(mockUser)
        await queryClient.invalidateQueries()
        router.replace("/?login=success")
      } catch (err) {
        console.error(err)
        handledRef.current = false
      }
    }

    handleLogin()
  }, [sub, accessToken, setSession, router, queryClient])

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-fuchsia-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-fuchsia-300 border-b-transparent rounded-full animate-spin-slow" style={{ animationDuration: '3s' }} />
          </div>

          <div className="text-center space-y-2 px-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Đang xác thực</h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              Vui lòng đợi trong khi chúng tôi xác minh thông tin đăng nhập của bạn...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-start justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/bg_login.jpg"
          alt="Login Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="relative z-10 w-full max-w-md mt-10">
        <Card className="w-full border-0 bg-white/85 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pt-6 pb-2 items-center">
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

            <MezonLoginButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
