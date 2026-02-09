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

export function requireAuth(req, res, next) {
  const token = parseBearerToken(req.headers?.authorization);
  if (!token) {
    next(new HttpError(401, "Nedostaje autorizacioni token."));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const userId = Number.parseInt(payload?.sub, 10);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new HttpError(401, "Token nije validan.");
    }

    req.auth = {
      userId,
      email: typeof payload?.email === "string" ? payload.email : null,
      firstName: typeof payload?.firstName === "string" ? payload.firstName : null,
      lastName: typeof payload?.lastName === "string" ? payload.lastName : null,
    };
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    next(new HttpError(401, "Token nije validan ili je istekao."));
  }
}
