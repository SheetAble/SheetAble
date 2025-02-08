import {
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core"

export const users = pgTable("user", {
	// id: serial("id").primaryKey(),
	email: varchar("email", { length: 255 }),
	username: varchar("username", { length: 255 }),
	password: text("password"),
})

export const table = {
	users,
} as const

import { drizzle } from "drizzle-orm/node-postgres"

export const db = drizzle(process.env.DATABASE_URL ?? "") // todo: move

export type Table = typeof table
