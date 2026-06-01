import { betterAuth } from "better-auth"
import { genericOAuth, customSession } from "better-auth/plugins"
import { getMezonProfile } from "@/services/user/user-service"
import { AUTH_URL } from "@/constants/api";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const isProduction = process.env.NODE_ENV === "production";

function getMezonRedirectUri() {
    return process.env.REDIRECT_URI ?? `${appUrl}/auth/callback`;
}

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: appUrl,
    trustedOrigins: [appUrl, "http://localhost:3000"],

    account: {
        storeAccountCookie: false,
    },

    advanced: {
        useSecureCookies: isProduction,
        cookies: {
            oauth_state: {
                attributes: {
                    path: "/",
                    sameSite: "lax",
                },
            },
            state: {
                attributes: {
                    path: "/",
                    sameSite: "lax",
                },
            },
        },
    },

    session: {
        strategy: "jwt",
        expiresIn: 60 * 60 * 24 * 7,
        cookieCache: {
            enabled: false,
        },
    },

    plugins: [
        customSession(async ({ user, session }) => {
            const customUser = user as typeof user & {
                userId?: string;
                username?: string;
                accessToken?: string;
            };

            return {
                user: {
                    ...user,
                    userId: customUser.userId,
                    username: customUser.username,
                    accessToken: customUser.accessToken,
                },
                session,
            };
        }),
        genericOAuth({
            config: [
                {
                    providerId: "mezon",
                    clientId: process.env.MEZON_CLIENT_ID ?? "",
                    clientSecret: process.env.MEZON_CLIENT_SECRET ?? "",
                    authorizationUrl: `${AUTH_URL}/oauth2/auth`,
                    tokenUrl: `${AUTH_URL}/oauth2/token`,
                    redirectURI: getMezonRedirectUri(),
                    scopes: ["openid", "offline"],
                    authentication: "post",
                    getUserInfo: async (tokens) => {
                        if (!tokens.idToken) {
                            throw new Error("Mezon authentication failed");
                        }

                        const profile = await getMezonProfile(tokens.idToken);
                        return {
                            id: profile.userId,
                            name: profile.name,
                            email: profile.email,
                            image: profile.image,
                            emailVerified: profile.emailVerified,
                            username: profile.username,
                            userId: profile.userId,
                            accessToken: profile.accessToken,
                        };
                    },
                }
            ]
        })
    ],

    user: {
        additionalFields: {
            username: { type: "string", required: false },
            userId: { type: "string", required: false },
            accessToken: { type: "string", required: false },
        },
    },
})

export type Session = typeof auth.$Infer.Session
export type AuthUser = typeof auth.$Infer.Session.user & {
    userId?: string;
    username?: string;
    accessToken?: string;
}
