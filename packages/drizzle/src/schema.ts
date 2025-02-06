import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	password: varchar("password").notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const table = {
	user,
} as const

export type Table = typeof table
