import { auth } from "@repo/better-auth/auth"
import { table } from "@repo/drizzle/schema"
import { db } from "@repo/drizzle/schema"
import type { UserCreationType } from "./type"

export async function createUser(body: UserCreationType) {
	const hashPassword = await Bun.password.hash(body.password)

	const user = await db.insert(table.users).values({
		email: body.email,
		password: hashPassword,
		username: body.name,
	})

	return `You are signed Up ${user}`
}

export async function getUsers() {
	const users = await db.select().from(table.users)

	return users
}

export async function signIn() {
	const response = await auth.api.signInEmail({
		body: {
			email: "test",
			password: "test",
		},
		asReponse: true,
	})

	return response
}
