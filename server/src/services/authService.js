import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

function makeToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// Never send the password hash to the client
export function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function register({ name, email, password }) {
  const emailLower = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: emailLower },
  });
  if (existing) {
    throw new AppError(
      409,
      "EMAIL_TAKEN",
      "An account with this email already exists.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: emailLower, passwordHash },
  });

  return { token: makeToken(user), user: publicUser(user) };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  const passwordOk =
    user && (await bcrypt.compare(password, user.passwordHash));

  // Same message for both cases so nobody can learn which emails exist
  if (!passwordOk) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Incorrect email or password.",
    );
  }

  return { token: makeToken(user), user: publicUser(user) };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "Please log in.");
  }
  return publicUser(user);
}
