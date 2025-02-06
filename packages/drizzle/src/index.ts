import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { usersTable } from "./schema";

const db = drizzle(process.env.DATABASE_URL ?? "");

async function main() {
	const user: typeof usersTable.$inferInsert = {
		name: "John",
		age: 30,
		email: "john@example.com",
	};
	await db.insert(usersTable).values(user);
	console.log("New user created!");
	const users = await db.select().from(usersTable);
	console.log("Getting all users from the database: ", users);
	/*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */
	await db
		.update(usersTable)
		.set({
			age: 31,
		})
		.where(eq(usersTable.email, user.email));
	console.log("User info updated!");
	await db.delete(usersTable).where(eq(usersTable.email, user.email));
	console.log("User deleted!");
}
main();
