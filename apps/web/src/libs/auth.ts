import { betterAuth } from "better-auth"
import { genericOAuth } from "better-auth/plugins"
import { userService } from "@/services/user/user-service"

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
                    clientId: process.env.MEZON_CLIENT_ID!,
                    clientSecret: process.env.MEZON_CLIENT_SECRET!,
                    authorizationUrl: `${process.env.MEZON_AUTH_URL}/oauth2/auth`,
                    tokenUrl: `${process.env.MEZON_AUTH_URL}/oauth2/token`,
                    redirectURI: process.env.REDIRECT_URI!,
                    scopes: ["openid", "offline"],
                    
                    getUserInfo: async (tokens) => {
                        return await userService.getMezonProfile(tokens);
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
