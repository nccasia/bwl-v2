import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authService } from "@/services/login"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import * as v from "valibot"
import { loginParamsSchema } from "@/schemas/login"

export function useLogin() {
  return {
    getLoginUrl: () => authService.getMezonLoginUrl(),
  }
}

export function useSession() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => authService.getSession(),
    staleTime: 1000 * 60 * 5, 
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      queryClient.clear()
      router.push("/login")
    },
  })
}

export function useLoginCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const handledRef = useRef(false)

  const paramsRaw = Object.fromEntries(searchParams.entries())
  const result = v.safeParse(loginParamsSchema, paramsRaw)

  const { sub, accessToken, error } = result.success
    ? result.output
    : { sub: undefined, accessToken: undefined, error: undefined }

  const isRedirecting = !!(sub && accessToken)

  const loginMutation = useMutation({
    mutationFn: async ({ currentSub, currentToken }: { currentSub: string; currentToken: string }) => {
      return authService.createSession(currentSub, currentToken)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      router.replace("/?login=success")
    },
    onError: (err) => {
      console.error(err)
    }
  })

  // We require a one-time effect to trigger the login mutation automatically on mount after redirect
  useEffect(() => {
    if (!sub || !accessToken || handledRef.current) return
    handledRef.current = true
    
    loginMutation.mutate({ currentSub: sub, currentToken: accessToken })
  }, [sub, accessToken, loginMutation])

  return {
    isRedirecting,
    error,
  }
}
