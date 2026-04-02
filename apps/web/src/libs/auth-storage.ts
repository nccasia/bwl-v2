import { MEZON_AUTH_URL } from "@/constants/api"

export async function getMezonUserInfo(tokens: any) {
    const userInfoUrl = `${MEZON_AUTH_URL}/userinfo`
    const profileRes = await fetch(userInfoUrl, {
        headers: { Authorization: `Bearer ${tokens.accessToken || tokens}` }
    })
    
    if (!profileRes.ok) {
        const err = await profileRes.text()
        console.error("Mezon UserInfo Error:", err)
        return null
    }

    const profile = await profileRes.json()

    return {
        name: profile.username || profile.display_name,
        email: profile.email,
        image: profile.avatar,
        id: String(profile.mezon_id),
        emailVerified: true,
    }
}
