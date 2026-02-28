import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initializeDatabase, shutdownDatabase } from "./db/database.js";
import { ensureAdminBootstrapAccount } from "./modules/admin/admin.bootstrap.js";

let serverInstance = null;

async function startServer() {
  await initializeDatabase();
  const adminBootstrapResult = await ensureAdminBootstrapAccount();
  if (adminBootstrapResult?.created) {
    console.log(
      `[INSPEKTOR BACKEND] bootstrap admin account created (${adminBootstrapResult.user.email})`
    );
  }

  const app = createApp();
  serverInstance = app.listen(env.port, env.host, () => {
    console.log(
      `[INSPEKTOR BACKEND] listening on http://${env.host}:${env.port} (db: ${env.dbPath})`
    );
  });
}

async function stopServer(signalName) {
  console.log(`[INSPEKTOR BACKEND] stopping (${signalName})...`);

  if (serverInstance) {
    await new Promise((resolve) => {
      serverInstance.close(() => resolve());
    });
  }

  await shutdownDatabase();
  process.exit(0);
}

process.on("SIGINT", () => {
  void stopServer("SIGINT");
});

process.on("SIGTERM", () => {
  void stopServer("SIGTERM");
});

startServer().catch((error) => {
  console.error("[INSPEKTOR BACKEND] startup failed", error);
  process.exit(1);
});
