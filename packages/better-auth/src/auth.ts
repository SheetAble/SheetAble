import { db } from "@repo/drizzle/schema"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
	},
	// socialProviders: {
	// 	github: {
	// 		clientId: process.env.GITHUB_CLIENT_ID,
	// 		clientSecret: process.env.GITHUB_CLIENT_SECRET,
	// 	},
	// },
})
