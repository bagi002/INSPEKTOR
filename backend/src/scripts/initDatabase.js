import { env } from "../config/env.js";
import { initializeDatabase, shutdownDatabase } from "../db/database.js";

async function init() {
  await initializeDatabase();
  console.log(`[INSPEKTOR BACKEND] database initialized at ${env.dbPath}`);
  await shutdownDatabase();
}

init().catch((error) => {
  console.error("[INSPEKTOR BACKEND] database init failed", error);
  process.exit(1);
});
