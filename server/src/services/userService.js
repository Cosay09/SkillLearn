import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { publicUser } from "./authService.js";

export async function getPublicProfile(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      department: true,
      year: true,
      bio: true,
      createdAt: true,
      userSkills: {
        where: { type: "offer" },
        select: { id: true, level: true, skill: true },
      },
    },
  });
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found.");

  const rating = await prisma.review.aggregate({
    where: { revieweeId: id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    ...user,
    avgRating: rating._avg.rating,
    ratingCount: rating._count.rating,
  };
}

export async function updateProfile(userId, data) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return publicUser(user);
}
