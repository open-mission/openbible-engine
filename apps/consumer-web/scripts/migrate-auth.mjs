import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@libsql/client";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required authentication configuration: ${name}`);
  return value;
}

const client = createClient({
  url: required("DATABASE_URL"),
  authToken: required("DATABASE_TURSO_TOKEN"),
});

try {
  const migration = await readFile(resolve("migrations/001-better-auth.sql"), "utf8");
  await client.executeMultiple(migration);
  console.log("Better Auth migration 001 applied");
} finally {
  client.close();
}
