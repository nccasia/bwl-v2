'use client'

import { authClient } from "@/libs/auth-client"
import { useAuthStore } from "@/stores/login/auth-store"
import { useEffect } from "react"

export function AuthSync() {
    const { data: session, isPending } = authClient.useSession()
    const setSession = useAuthStore((state) => state.setSession)
    const clearSession = useAuthStore((state) => state.clearSession)

    useEffect(() => {
        if (isPending) return

        if (session?.user) {    
            setSession({
                id: session.user.id,
                username: session.user.name,
                email: session.user.email,
                avatar: session.user.image || undefined,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                accessToken: (session.user as any).accessToken,
            })
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((session.user as any).accessToken) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                localStorage.setItem("accessToken", (session.user as any).accessToken)
            }
        } else {
            clearSession()
            localStorage.removeItem("accessToken")
        }
    }, [session, isPending, setSession, clearSession])

    return null
}
