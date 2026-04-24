import * as v from "valibot"

export const loginParamsSchema = v.object({
  sub: v.optional(v.string()),
  accessToken: v.optional(v.string()),
  error: v.optional(v.string()),
})

export type LoginParams = v.InferInput<typeof loginParamsSchema>

export const userSchema = v.object({
  id: v.string(),
  userName: v.optional(v.string()),
  displayName: v.optional(v.string()),
  avatar: v.optional(v.string()),
  email: v.optional(v.string()),
  accessToken: v.optional(v.string()),
})

export type User = v.InferInput<typeof userSchema>
