import { defineConfig } from "drizzle-kit";

// I use this file to tell Drizzle how to create and update my database tables.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // I keep the real database link in .env.local so it does not get uploaded to GitHub.
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
