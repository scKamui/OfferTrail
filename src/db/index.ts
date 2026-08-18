import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// I connect only when the app needs the database, which also keeps builds from failing early.
let database: ReturnType<typeof createDatabase> | null = null;

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing. Add it to your .env.local file.");
  }

  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

// I use this helper for every query so the connection setup stays in one place.
export function getDatabase() {
  if (!database) {
    database = createDatabase();
  }

  return database;
}
