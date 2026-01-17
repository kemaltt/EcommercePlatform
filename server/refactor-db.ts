import { pool } from "./src/config/db";
import "dotenv/config";

async function run() {
  console.log("Refactoring addresses table columns...");
  try {
    const client = await pool.connect();

    // Check if address_line exists
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'addresses' AND column_name = 'address_line';
    `);

    if (res.rows.length > 0) {
      console.log(
        "Renaming address_line to address_line1 and adding address_line2...",
      );
      await client.query(`
        ALTER TABLE "addresses" RENAME COLUMN "address_line" TO "address_line1";
        ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "address_line2" text;
      `);
    } else {
      console.log(
        "address_line not found. Ensuring address_line1 and address_line2 exist...",
      );
      await client.query(`
        ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "address_line1" text;
        ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "address_line2" text;
        -- If we just added address_line1, it might need to be NOT NULL
        -- but we need data to be safe. For now just ensure they exist.
      `);

      // Make address_line1 NOT NULL if it's currently nullable and we want it to be required
      // Be careful if there's existing data!
      // await client.query('ALTER TABLE "addresses" ALTER COLUMN "address_line1" SET NOT NULL;');
    }

    console.log("Addresses table refactored successfully!");
    client.release();
  } catch (error) {
    console.error("Error refactoring table:", error);
  } finally {
    process.exit(0);
  }
}

run();
