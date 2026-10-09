import jwt from "jsonwebtoken";
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
