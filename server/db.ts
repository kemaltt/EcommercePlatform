import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString = 'postgresql://neondb_owner:npg_qZBcQkv8H5xj@ep-tight-star-a66ysiur.us-west-2.aws.neon.tech/neondb?sslmode=require';

// Bağlantıyı test et
async function testConnection() {
  const testPool = new Pool({ connectionString });
  try {
    console.log("Testing database connection...");
    await testPool.query('SELECT NOW()');
    console.log("Database connection successful!");
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  } finally {
    await testPool.end();
  }
}

// Pool ve db'yi oluştur
export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });

// Uygulama başladığında bağlantıyı test et
testConnection().catch(console.error);