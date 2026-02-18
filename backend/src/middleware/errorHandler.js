export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    message: "Ruta nije pronađena.",
  });
}

export function errorHandler(error, req, res, _next) {
  const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
  const responseBody = {
    ok: false,
    message: error?.message || "Došlo je do neočekivane greške.",
  };

  if (error?.details) {
    responseBody.errors = error.details;
  }

  res.status(statusCode).json(responseBody);
}
