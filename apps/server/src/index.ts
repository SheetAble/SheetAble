import "dotenv/config"
import swagger from "@elysiajs/swagger"
import { auth } from "@repo/better-auth/auth"
import { type Context, Elysia, type Static, t } from "elysia"
import { type Session, type User, userCreationType } from "./handlers/type"
import { createUser, getUsers, signIn } from "./handlers/user"

const betterAuthView = (context: Context) => {
	const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"]
	// validate request method
	if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
		return auth.handler(context.request)
	}
	context.error(405)
}

const userMiddleware = async (request: Request) => {
	const session = await auth.api.getSession({ headers: request.headers })

	if (!session) {
		return {
			user: null,
			session: null,
		}
	}

	return {
		user: session.user,
		session: session.session,
	}
}

// user info view
// type User can be export from `typeof auth.$Infer.Session.user`
// type Session can be export from `typeof auth.$Infer.Session.session`
const userInfo = (user: User | null, session: Session | null) => {
	return {
		user: user,
		session: session,
	}
}

const app = new Elysia()
	.derive(({ request }) => userMiddleware(request))
	.use(swagger())
	.all("/api/auth/*", betterAuthView)
	.get("/", () => "Hello Elysia")
	.post(
		"sign-up",
		({ body }) => {
			createUser(body)
		},
		{
			body: userCreationType,
		},
	)
	// Example custom endpoint
	.get("/user", ({ user, session }) => userInfo(user, session))
	.get("/users", () => {
		return getUsers()
	})
	.get("/sign-in", () => signIn())
	.listen(8080)

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
