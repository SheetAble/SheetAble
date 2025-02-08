import "dotenv/config"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { table } from "./schema"

const db = drizzle(process.env.DATABASE_URL ?? "")

// async function main() {
// 	const user = {
// 		name: "John",
// 		email: "john@example.com",
// 	}
// 	await db.insert(table.usersTable).values(user)
// 	console.log("New user created!")
// 	const users = await db.select().from(table.usersTable)
// 	console.log("Getting all users from the database: ", users)
// 	/*
//   const users: {
//     id: number;
//     name: string;
//     age: number;
//     email: string;
//   }[]
//   */
// 	await db
// 		.update(table.usersTable)
// 		.set({})
// 		.where(eq(table.usersTable.email, user.email))
// 	console.log("User info updated!")
// 	await db
// 		.delete(table.usersTable)
// 		.where(eq(table.usersTable.email, user.email))
// 	console.log("User deleted!")

// 	const usersnew = await db.select().from(table.usersTable)
// 	console.log("Getting all users from the database: ", usersnew)
// }
// main()
