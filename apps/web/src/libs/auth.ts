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
                    clientId: process.env.MEZON_CLIENT_ID!,
                    clientSecret: process.env.MEZON_CLIENT_SECRET!,
                    authorizationUrl: `${process.env.MEZON_AUTH_URL}/oauth2/auth`,
                    tokenUrl: `${process.env.MEZON_AUTH_URL}/oauth2/token`,
                    redirectURI: process.env.REDIRECT_URI!,
                    scopes: ["openid", "offline"],
                    
                    getUserInfo: async (tokens) => {
                        const profileRes = await fetch(`${process.env.MEZON_AUTH_URL}/userinfo`, {
                            headers: { Authorization: `Bearer ${typeof tokens === 'string' ? tokens : tokens.accessToken}` }
                        });
                        
                        if (!profileRes.ok) return null;
                        const profile = await profileRes.json() as MezonProfile;

                        const idToken = (tokens as any).idToken || (tokens as any).id_token;
                        const beAccessToken = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/mezon-login`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id_token: idToken }),
                        })
                        .then(res => res.json())
                        .then(data => data.data?.accessToken || data.accessToken)
                        .catch(() => ""); 

                        return {
                            id: String(profile.mezon_id),
                            name: profile.username || profile.display_name,
                            email: profile.email,
                            image: profile.avatar,
                            emailVerified: true,
                            accessToken: beAccessToken, 
                        };
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
