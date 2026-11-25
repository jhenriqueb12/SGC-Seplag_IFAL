import { createHmac, timingSafeEqual } from "node:crypto";

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não foi configurado.");

  const [encodedPayload, receivedSignature] = token.split(".");
  if (!encodedPayload || !receivedSignature) return null;

  const expectedSignature = createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    received.length !== expected.length
    || !timingSafeEqual(received, expected)
  ) {
    return null;
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  );

  if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");

  if (!token || token === authorization) {
    return res.status(401).json({ error: "Autenticação necessária." });
  }

  try {
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (error) {
    return next(error);
  }
}
