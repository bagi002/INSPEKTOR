import { verifyAccessToken } from "../modules/auth/auth.token.js";
import { HttpError } from "../utils/httpError.js";

function parseBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export function requireAdminPanelAuth(req, res, next) {
  const token = parseBearerToken(req.headers?.authorization);
  if (!token) {
    next(new HttpError(401, "Nedostaje admin autorizacioni token."));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const userId = Number.parseInt(payload?.sub, 10);
    const scope = typeof payload?.scope === "string" ? payload.scope : "";
    const role = typeof payload?.role === "string" ? payload.role : "";

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new HttpError(401, "Token nije validan.");
    }
    if (scope !== "admin_panel" || role !== "admin") {
      throw new HttpError(403, "Pristup admin panelu nije dozvoljen.");
    }

    req.adminAuth = {
      userId,
      email: typeof payload?.email === "string" ? payload.email : null,
    };
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    next(new HttpError(401, "Admin token nije validan ili je istekao."));
  }
}
