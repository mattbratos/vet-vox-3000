import { drizzle } from "drizzle-orm/vercel-postgres"
import { sql } from "@vercel/postgres"
import * as schema from "../lib/db/schema"

async function main() {
  const db = drizzle(sql)

  console.log("Creating tables...")
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${schema.users};
    CREATE TABLE IF NOT EXISTS ${schema.accounts};
    CREATE TABLE IF NOT EXISTS ${schema.sessions};
    CREATE TABLE IF NOT EXISTS ${schema.verificationTokens};
  `)
  console.log("Tables created successfully!")
}

main().catch((err) => {
  console.error("Error creating tables:", err)
  process.exit(1)
})

