import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import "dotenv/config";

neonConfig.webSocketConstructor = ws;

// .env dosyasından DATABASE_URL'i oku
const connectionString = process.env.DATABASE_URL;

// DATABASE_URL tanımlı değilse hata ver
if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set. Please check your .env file.");
  process.exit(1); // Uygulamayı durdur
}

// Bağlantıyı test et
async function testConnection() {
  // Test pool'u için de process.env kullan
  const testPool = new Pool({ connectionString });
  try {
    console.log("Testing database connection...");
    await testPool.query('SELECT NOW()');
    console.log("Database connection successful!");
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    // Hata durumunda uygulamayı durdurmak yerine sadece loglamak daha iyi olabilir
    // process.exit(1);
    return false;
  } finally {
    await testPool.end();
  }
}

// Pool ve db'yi oluştur (process.env kullan)
export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });

// Uygulama başladığında bağlantıyı test et
testConnection().catch(console.error);