import { env } from "../config/env.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    message: "Ruta nije pronadjena.",
  });
}

export function errorHandler(error, req, res, _next) {
  const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
  const responseBody = {
    ok: false,
    message: error?.message || "Doslo je do neocekivane greske.",
  };

  if (error?.details) {
    responseBody.errors = error.details;
  }

  if (statusCode >= 500 && env.nodeEnv !== "production") {
    responseBody.debug = error?.stack || "No stack trace available";
  }

  res.status(statusCode).json(responseBody);
}
