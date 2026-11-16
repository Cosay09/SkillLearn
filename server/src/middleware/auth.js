import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return next(new AppError(401, "UNAUTHORIZED", "Please log in."));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    next(
      new AppError(
        401,
        "UNAUTHORIZED",
        "Your session has expired. Please log in again.",
      ),
    );
  }
}

// Use after requireAuth on every route that unverified students must not reach
export async function requireVerified(req, res, next) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { emailVerifiedAt: true },
  });

  if (!user?.emailVerifiedAt) {
    return next(
      new AppError(
        403,
        "EMAIL_NOT_VERIFIED",
        "Verify your university email first.",
      ),
    );
  }
  next();
}
