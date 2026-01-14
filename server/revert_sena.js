
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

if (!global.WebSocket) {
  global.WebSocket = ws;
}

const sql = neon(process.env.DATABASE_URL);

async function revertSena() {
  try {
    console.log("Updating Sena (masaloungee1@gmail.com) to NOT be admin...");
    const result = await sql`UPDATE users SET is_admin = false WHERE email = 'masaloungee1@gmail.com' RETURNING *`;
    console.log("Update successful:", result[0]);
  } catch (err) {
    console.error("Error:", err);
  }
}

revertSena();
