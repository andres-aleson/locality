import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

// Migrations need a role that owns the `locality` schema's tables. The app's
// DATABASE_URL (`locality_app`) can only read/write rows, so drizzle-kit uses
// a separate admin connection string that is never given to Vercel.
const baseUrl = process.env.MIGRATION_DATABASE_URL;
if (!baseUrl) {
  throw new Error("MIGRATION_DATABASE_URL is not set");
}
// drizzle-kit ignores `dbCredentials.ssl` when given a url, so SSL has to be
// requested in the connection string or remote hosts reject the connection.
const url = baseUrl.includes("sslmode=")
  ? baseUrl
  : `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}sslmode=require`;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  schemaFilter: ["locality"],
  dbCredentials: { url },
  migrations: { schema: "locality" },
});
