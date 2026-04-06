import { betterAuth } from "better-auth"
import { genericOAuth } from "better-auth/plugins"



interface MezonProfile {
    username?: string;
    display_name?: string;
    email?: string;
    avatar?: string;
    mezon_id: string | number;
}

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.NEXT_PUBLIC_APP_URL as string,

    session: {
        expiresIn: 60 * 60 * 24 * 7, 
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,       
            strategy: "jwt",      
        },
    },

    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: "mezon",
                    clientId: process.env.MEZON_CLIENT_ID as string,
                    clientSecret: process.env.MEZON_CLIENT_SECRET as string,
                    authorizationUrl: (process.env.MEZON_AUTH_URL as string) + "/oauth2/auth",
                    tokenUrl: (process.env.MEZON_AUTH_URL as string) + "/oauth2/token",
                    redirectURI: process.env.REDIRECT_URI as string,
                    scopes: ["openid", "offline"],
                    
                    getUserInfo: async (tokens) => {
                        const userInfoUrl = `${process.env.MEZON_AUTH_URL}/userinfo`
                        const profileRes = await fetch(userInfoUrl, {
                            headers: { Authorization: `Bearer ${(tokens as { accessToken?: string }).accessToken || tokens}` }
                        })
                        
                        if (!profileRes.ok) {
                            const err = await profileRes.text()
                            console.error("Mezon UserInfo Error:", err)
                            return null
                        }

                        const profile = await profileRes.json() as MezonProfile
                        const userInfo = {
                            name: profile.username || profile.display_name,
                            email: profile.email,
                            image: profile.avatar,
                            id: String(profile.mezon_id),
                            emailVerified: true,
                        }


                        let accessToken = ""
                        try {
                            const tokensObj = tokens as { idToken?: string; id_token?: string }
                            const id_token = tokensObj.idToken || tokensObj.id_token
                            const beResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/mezon-login`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    id_token: id_token,
                                }),
                            })
                            const beData = await beResponse.json()
                            accessToken = beData.data?.accessToken || beData.accessToken || ""
                        } catch (e) {
                            console.error( e)
                        }
                        return {
                            ...userInfo,
                            accessToken: accessToken,
                        }
                    },
                }
            ]
        })
    ],

    user: {
        additionalFields: {
            sub: { type: "string", required: false },
            accessToken: { type: "string", required: false },
        },
    },
})

export type Session = typeof auth.$Infer.Session
export type AuthUser = typeof auth.$Infer.Session.user
