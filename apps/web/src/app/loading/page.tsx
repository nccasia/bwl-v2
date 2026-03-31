"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import Image from "next/image"
import { saveUser } from "@/hooks/useAuth"

function LoadingContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const sub = searchParams.get("sub")
    const accessToken = searchParams.get("accessToken")
    const username = searchParams.get("username") ?? searchParams.get("name") ?? sub ?? ""
    const displayName = searchParams.get("display_name") || searchParams.get("displayName") || username
    const avatar = searchParams.get("avatar") ?? searchParams.get("picture") ?? ""

    const isValidAuth = Boolean(sub && accessToken)

    if (isValidAuth) {
      saveUser({
        sub: sub!,
        username,
        displayName,
        avatar,
        accessToken: accessToken!,
      })
    }

    const redirectUrl = isValidAuth ? "/" : "/login"
    window.location.replace(redirectUrl)
  }, [searchParams])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Background />
      <Overlay />
      <Content />
    </div>
  )
}

function Background() {
  return (
    <div className="absolute inset-0 z-0">
      <Image
        src="/assets/img/bg_login.jpg"
        alt="background"
        fill
        priority
        className="object-cover"
      />
    </div>
  )
}

function Overlay() {
  return <div className="absolute inset-0 z-1 bg-black/30 backdrop-blur-[4px]" />
}

function Content() {
  return (
    <div className="relative z-10 flex flex-col items-center space-y-8 rounded-3xl border border-white/20 bg-white/90 backdrop-blur-xl p-10 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-500">
      <Spinner />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Đang xác thực
        </h1>
        <p className="max-w-xs text-muted-foreground font-medium">
          Vui lòng đợi trong khi chúng tôi xác minh thông tin đăng nhập của bạn...
        </p>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="relative h-24 w-24">
      <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-primary border-r-primary/30" />
      <div className="absolute inset-2 animate-pulse rounded-full bg-primary/5 flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-primary" />
      </div>
    </div>
  )
}

export default function LoadingPage() {
  return (
    <Suspense fallback={null}>
      <LoadingContent />
    </Suspense>
  )
}