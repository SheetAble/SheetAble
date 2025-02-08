import type { auth } from "@repo/better-auth/auth"
import { type Static, t } from "elysia"

export const userCreationType = t.Object({
	name: t.String(),
	email: t.String(),
	password: t.String(),
})

export type UserCreationType = Static<typeof userCreationType>

export type User = typeof auth.$Infer.Session.user
export type Session = typeof auth.$Infer.Session.session
