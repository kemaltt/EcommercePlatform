
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

if (!global.WebSocket) {
  global.WebSocket = ws;
}

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  try {
    console.log("Fetching users from DB via raw SQL...");
    const users = await sql`SELECT id, email, full_name, is_admin, status, trial_expires_at FROM users`;
    console.log("Users in DB:");
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.full_name}, isAdmin: ${u.is_admin}, Status: ${u.status}, Trial Expires: ${u.trial_expires_at}`);
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

checkUsers();
