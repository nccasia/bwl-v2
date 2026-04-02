import { betterAuth } from "better-auth"
import { genericOAuth } from "better-auth/plugins"
import { getMezonUserInfo } from "./auth-storage"
import { API_URL, APP_URL, CLIENT_ID, CLIENT_SECRET, MEZON_AUTH_URL, REDIRECT_URI } from "@/constants/api"

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: APP_URL,

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
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    authorizationUrl: MEZON_AUTH_URL + "/oauth2/auth",
                    tokenUrl: MEZON_AUTH_URL + "/oauth2/token",
                    redirectURI: REDIRECT_URI,
                    scopes: ["openid", "offline"],
                    
                    getUserInfo: async (tokens: any) => {
                        const userInfo = await getMezonUserInfo(tokens)
                        if (!userInfo) return null

                        let accessToken = ""
                        try {
                            const beResponse = await fetch(`${API_URL}/v1/auth/mezon-login`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    id_token: tokens.idToken,
                                }),
                            })
                            const beData = await beResponse.json()
                            accessToken = beData.accessToken || ""
                        } catch (e) {
                            console.error(e)
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
