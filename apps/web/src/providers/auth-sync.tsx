import { authClient } from "@/libs/auth-client"
import { useAuthStore } from "@/stores/login/auth-store"
import { useEffect } from "react"
import type { AuthUser } from "@/libs/auth"

export function AuthSync() {
    const { data: session, isPending } = authClient.useSession()
    const setSession = useAuthStore((state) => state.setSession)
    const clearSession = useAuthStore((state) => state.clearSession)

    useEffect(() => {
        if (isPending) return

        if (session?.user) {    
            const user = session.user as AuthUser
            setSession({
                id: user.id,
                username: user.name,
                email: user.email || undefined,
                avatar: user.image || undefined,
                accessToken: user.accessToken || undefined,
            })
            
            if (user.accessToken) {
                localStorage.setItem("accessToken", user.accessToken)
            }
        } else {
            clearSession()
            localStorage.removeItem("accessToken")
        }
    }, [session, isPending, setSession, clearSession])

    return null
}
