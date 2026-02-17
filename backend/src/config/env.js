import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

function parsePort(value, fallbackPort) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallbackPort;
  }

  return parsed;
}

function parseOrigins(value) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../..");
const projectRoot = path.resolve(backendRoot, "..");

const providedDbPath = process.env.DB_PATH || "Instances/inspektor.sqlite";
const resolvedDbPath = path.isAbsolute(providedDbPath)
  ? providedDbPath
  : path.resolve(projectRoot, providedDbPath);
const resolvedFrontendOrigins = parseOrigins(
  process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:5174"
);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  host: process.env.HOST || "0.0.0.0",
  port: parsePort(process.env.PORT, 3001),
  frontendOrigins:
    resolvedFrontendOrigins.length > 0
      ? resolvedFrontendOrigins
      : ["http://localhost:5173", "http://localhost:5174"],
  jwtSecret: process.env.JWT_SECRET || "inspektor-dev-jwt-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  dbPath: resolvedDbPath,
  adminPanelPassword: process.env.ADMIN_PANEL_PASSWORD || "inspektor-admin-panel",
  adminBootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@inspektor.local",
  adminBootstrapPassword: process.env.ADMIN_BOOTSTRAP_PASSWORD || "Admin12345!",
  adminBootstrapFirstName: process.env.ADMIN_BOOTSTRAP_FIRST_NAME || "System",
  adminBootstrapLastName: process.env.ADMIN_BOOTSTRAP_LAST_NAME || "Admin",
};
