import { getDatabaseHealth } from "../../db/database.js";

export async function healthController(req, res) {
  const databaseHealth = await getDatabaseHealth();

  res.status(200).json({
    ok: true,
    message: "API i baza su dostupni.",
    data: {
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database: databaseHealth,
    },
  });
}
