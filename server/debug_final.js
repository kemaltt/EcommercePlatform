
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// Polyfill WebSocket for Neon driver
if (!global.WebSocket) {
  global.WebSocket = ws;
}

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  try {
    console.log("Fetching users from DB via raw SQL...");
    const result = await sql`SELECT id, email, full_name, is_admin FROM users`;
    console.log("Users in DB:");
    result.forEach(u => {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.full_name}, isAdmin: ${u.is_admin} (${typeof u.is_admin})`);
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

checkUsers();
