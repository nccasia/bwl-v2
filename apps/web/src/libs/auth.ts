import { betterAuth, type BetterAuthPlugin } from "better-auth"
import { createAuthEndpoint } from "better-auth/api"
import { APIError } from "better-auth/api"

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? "changeme-please-set-a-real-secret"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

const mezonPlugin = () =>
  ({
    id: "mezon",
    endpoints: {
      signInMezon: createAuthEndpoint(
        "/sign-in/mezon",
        { method: "POST" },
        async (ctx: any) => {
          const body = ctx.body as { sub?: string; accessToken?: string } | undefined
          const sub = body?.sub
          const accessToken = body?.accessToken

          if (!sub || !accessToken) {
            throw new APIError("BAD_REQUEST", {
              message: "sub and accessToken are required",
            })
          }

          const session = await ctx.context.internalAdapter.createSession(
            sub,
            ctx.request,
            false,
            { sub, accessToken } as Record<string, unknown>,
          )

          if (!session) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Failed to create session",
            })
          }

          ctx.setCookie(
            ctx.context.authCookies.sessionToken.name,
            session.token,
            ctx.context.authCookies.sessionToken.options,
          )

          return ctx.json({ session })
        },
      ),
    },
  }) satisfies BetterAuthPlugin

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: APP_URL,

  session: {
    expiresIn: 60 * 60 * 24 * 7, 
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,       
      strategy: "jwt",      
    },
  },

  plugins: [mezonPlugin()],

  user: {
    additionalFields: {
      sub: { type: "string", required: false },
      accessToken: { type: "string", required: false },
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type AuthUser = typeof auth.$Infer.Session.user
