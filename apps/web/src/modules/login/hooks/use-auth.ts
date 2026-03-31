import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "../../../services/login/auth-service"
import { useAuthStore } from "@/stores/login/auth-store"
import { useRouter } from "next/navigation"

export function useLogin() {
  return {
    getLoginUrl: () => authService.getMezonLoginUrl(),
  }
}

export function useLogout() {
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((state) => state.clearSession)
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      clearSession()
      queryClient.clear()
    },
    onSuccess: () => {
      router.push("/login")
    }
  })
}
