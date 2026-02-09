import { env } from "../config/env.js";
import { applyMigrations } from "./migrations.js";
import {
  closeDatabaseConnection,
  getOne,
  openSqliteDatabase,
  runQuery,
} from "./sqliteClient.js";

let activeDatabase = null;

async function applyDatabaseMaintenanceSettings(database) {
  await runQuery(database, "PRAGMA foreign_keys = ON;");
  await runQuery(database, "PRAGMA journal_mode = WAL;");
  await runQuery(database, "PRAGMA synchronous = NORMAL;");
}

export async function initializeDatabase() {
  if (activeDatabase) {
    return activeDatabase;
  }

  const database = await openSqliteDatabase(env.dbPath);
  await applyDatabaseMaintenanceSettings(database);
  await applyMigrations(database);
  activeDatabase = database;
  return activeDatabase;
}

export function getDatabase() {
  if (!activeDatabase) {
    throw new Error("Database is not initialized.");
  }

  return activeDatabase;
}

export async function getDatabaseHealth() {
  const database = getDatabase();
  const row = await getOne(
    database,
    `
      SELECT
        (SELECT COUNT(*) FROM users) AS usersCount,
        (SELECT COUNT(*) FROM cases) AS casesCount
    `
  );

  return {
    usersCount: row?.usersCount ?? 0,
    casesCount: row?.casesCount ?? 0,
    dbPath: env.dbPath,
  };
}

export async function shutdownDatabase() {
  if (!activeDatabase) {
    return;
  }

  await closeDatabaseConnection(activeDatabase);
  activeDatabase = null;
}
