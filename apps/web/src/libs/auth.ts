import { betterAuth } from "better-auth"
import { genericOAuth, customSession } from "better-auth/plugins"
import { userService } from "@/services/user/user-service"
import { AUTH_URL } from "@/constants/api";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.NEXT_PUBLIC_APP_URL as string,

    session: {
        strategy: "jwt",
        expiresIn: 60 * 60 * 24 * 7, 
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,       
            strategy: "jwt",      
        },
    },

    plugins: [
        customSession(async ({ user, session }) => {
            const customUser = user as typeof user & {
                accessToken?: string;
                userId?: string;
                username?: string;
            };
            return {
                user: {
                    ...user,
                    accessToken: customUser.accessToken,
                    userId: customUser.userId,
                    username: customUser.username,
                },
                session,
            };
        }),
        genericOAuth({
            config: [
                {
                    providerId: "mezon",
                    clientId: process.env.MEZON_CLIENT_ID!,
                    clientSecret: process.env.MEZON_CLIENT_SECRET!,
                    authorizationUrl: `${AUTH_URL}/oauth2/auth`,
                    tokenUrl: `${AUTH_URL}/oauth2/token`,
                    redirectURI: process.env.REDIRECT_URI!,
                    scopes: ["openid", "offline"],
                    
                    getUserInfo: async (tokens) => {
                        if (!tokens.accessToken || !tokens.idToken) {
                            throw new Error("Mezon authentication failed");
                        }
                        return await userService.getMezonProfile({
                            accessToken: tokens.accessToken,
                            idToken: tokens.idToken,
                        });
                    },
                    
                }
            ]
        })
    ],

    user: {
        additionalFields: {
            username: { type: "string", required: false },
            sub: { type: "string", required: false },
            accessToken: { type: "string", required: false },
            userId: { type: "string", required: false },
        },
    },
})

export type Session = typeof auth.$Infer.Session
export type AuthUser = typeof auth.$Infer.Session.user
