import { AppError } from "./AppError.js";

export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid id.");
  }
  return id;
}
