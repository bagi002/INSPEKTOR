import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import announcementsRoutes from "./modules/announcements/announcements.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import casesRoutes from "./modules/cases/cases.routes.js";
import healthRoutes from "./modules/health/health.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import supportRoutes from "./modules/support/support.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (env.nodeEnv !== "production") {
          callback(null, true);
          return;
        }
        if (env.frontendOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS origin nije dozvoljen."));
      },
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
  app.use("/api/profile", profileRoutes);
  app.use("/api/announcements", announcementsRoutes);
  app.use("/api/cases", casesRoutes);
  app.use("/api/support", supportRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
