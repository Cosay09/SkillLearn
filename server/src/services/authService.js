import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { sendVerificationEmail } from "./mailService.js";

const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000; // a verification link works for 24 hours
const RESEND_WAIT_MS = 60 * 1000; // at most one new email a minute

function makeToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// Never send secrets to the client
export function publicUser(user) {
  const { passwordHash, verifyTokenHash, verifyTokenExpiry, ...rest } = user;
  return rest;
}

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");

function allowedDomains() {
  return (process.env.ALLOWED_EMAIL_DOMAINS || "cse.bubt.edu.bd")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

// The domain must match exactly, so "name@cse.bubt.edu.bd.evil.com" is refused
function assertUniversityEmail(email) {
  const domain = email.slice(email.lastIndexOf("@") + 1);
  const domains = allowedDomains();

  if (!domains.includes(domain)) {
    const shown = domains.map((d) => `@${d}`).join(" or ");
    throw new AppError(
      400,
      "EMAIL_NOT_ALLOWED",
      `Use your university email (${shown}).`,
    );
  }
}

// Makes a fresh one-time token, saves only its hash, and emails the link
async function issueVerification(user) {
  const rawToken = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verifyTokenHash: hash(rawToken),
      verifyTokenExpiry: new Date(Date.now() + TOKEN_LIFETIME_MS),
    },
  });

  const link = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
  await sendVerificationEmail({ to: user.email, name: user.name, link });
}

export async function register({ name, email, password }) {
  const emailLower = email.toLowerCase();
  assertUniversityEmail(emailLower);

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

  // A failed email must not undo the sign-up: the student can ask for a new link
  try {
    await issueVerification(user);
  } catch (err) {
    console.error("Could not send verification email:", err.message);
  }

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

export async function verifyEmail(token) {
  const user = await prisma.user.findFirst({
    where: {
      verifyTokenHash: hash(token),
      verifyTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError(
      400,
      "INVALID_TOKEN",
      "This link is invalid or has expired.",
    );
  }

  // Clearing the token makes the link one-time use
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      verifyTokenHash: null,
      verifyTokenExpiry: null,
    },
  });

  return publicUser(updated);
}

export async function resendVerification(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "Please log in.");
  }
  if (user.emailVerifiedAt) {
    throw new AppError(
      400,
      "ALREADY_VERIFIED",
      "Your email is already verified.",
    );
  }

  // The expiry is always "sent time + 24 hours", so it also tells us when we last sent
  if (user.verifyTokenExpiry) {
    const sentAt = user.verifyTokenExpiry.getTime() - TOKEN_LIFETIME_MS;
    const waitMs = RESEND_WAIT_MS - (Date.now() - sentAt);
    if (waitMs > 0) {
      const seconds = Math.ceil(waitMs / 1000);
      throw new AppError(
        429,
        "TOO_SOON",
        `Please wait ${seconds} seconds before asking for another email.`,
      );
    }
  }

  try {
    await issueVerification(user);
  } catch (err) {
    console.error("Could not send verification email:", err.message);
    throw new AppError(
      502,
      "EMAIL_FAILED",
      "We could not send the email. Please try again in a moment.",
    );
  }
}
