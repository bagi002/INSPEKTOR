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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../..");
const projectRoot = path.resolve(backendRoot, "..");

const providedDbPath = process.env.DB_PATH || "Instances/inspektor.sqlite";
const resolvedDbPath = path.isAbsolute(providedDbPath)
  ? providedDbPath
  : path.resolve(projectRoot, providedDbPath);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  host: process.env.HOST || "0.0.0.0",
  port: parsePort(process.env.PORT, 3001),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "inspektor-dev-jwt-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  dbPath: resolvedDbPath,
};
