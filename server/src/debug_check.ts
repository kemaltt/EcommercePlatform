import { db } from "./config/db";
import { users, type User } from "../../shared/schema";

async function checkUsers() {
  try {
    console.log("Fetching users from DB...");
    const allUsers = await db.select().from(users as any);
    console.log("Users in DB:");
    allUsers.forEach((u: any) => {
      console.log(
        `- ID: ${u.id}, Email: ${u.email}, FullName: ${u.fullName}, isAdmin: ${
          u.isAdmin
        } (${typeof u.isAdmin})`,
      );
    });
    process.exit(0);
  } catch (err) {
    console.error("Error fetching users:", err);
    process.exit(1);
  }
}

checkUsers();
