import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import casesRoutes from "./modules/cases/cases.routes.js";
import healthRoutes from "./modules/health/health.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.frontendOrigin,
    })
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/", (req, res) => {
    res.status(200).json({
      ok: true,
      message: "INSPEKTOR backend je aktivan.",
    });
  });

  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/cases", casesRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
