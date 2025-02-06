import "dotenv/config"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { table } from "./schema"

const db = drizzle(process.env.DATABASE_URL ?? "")

// async function main() {
// 	const user: typeof table.user.$inferInsert = {
// 		name: "John",
// 		email: "john@example.com",
// 	};
// 	await db.insert(table.user).values(user);
// 	console.log("New user created!");
// 	const users = await db.select().from(table.user);
// 	console.log("Getting all users from the database: ", users);
// 	/*
//   const users: {
//     id: number;
//     name: string;
//     age: number;
//     email: string;
//   }[]
//   */
// 	await db
// 		.update(table.user)
// 		.set({

// 		})
// 		.where(eq(table.user.email, user.email));
// 	console.log("User info updated!");
// 	await db.delete(table.user).where(eq(table.user.email, user.email));
// 	console.log("User deleted!");

// 	const usersnew = await db.select().from(table.user);
// 	console.log("Getting all users from the database: ", usersnew);
// }
// main();
