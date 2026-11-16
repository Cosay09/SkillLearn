import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export function listSkills({ search, category }) {
  const where = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (category) where.category = { equals: category, mode: "insensitive" };
  return prisma.skill.findMany({ where, orderBy: { name: "asc" } });
}

export async function createSkill({ name, category }) {
  const existing = await prisma.skill.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) {
    throw new AppError(
      409,
      "SKILL_EXISTS",
      "This skill is already in the list.",
    );
  }
  return prisma.skill.create({ data: { name, category } });
}

export function getMySkills(userId) {
  return prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true },
    orderBy: { id: "asc" },
  });
}

export async function addMySkill(userId, { skillId, type, level }) {
  const skill = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!skill) throw new AppError(404, "NOT_FOUND", "Skill not found.");

  const existing = await prisma.userSkill.findUnique({
    where: { userId_skillId_type: { userId, skillId, type } },
  });
  if (existing) {
    throw new AppError(409, "ALREADY_ADDED", "You already added this skill.");
  }

  return prisma.userSkill.create({
    data: {
      userId,
      skillId,
      type,
      level: type === "offer" ? (level ?? "beginner") : null,
    },
    include: { skill: true },
  });
}

export async function removeMySkill(userId, id) {
  const row = await prisma.userSkill.findFirst({ where: { id, userId } });
  if (!row) throw new AppError(404, "NOT_FOUND", "Skill entry not found.");
  await prisma.userSkill.delete({ where: { id } });
}
