import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { publicUser } from "./authService.js";

export async function getPublicProfile(id, viewerId) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      department: true,
      year: true,
      bio: true,
      createdAt: true,
      emailVerifiedAt: true,
      userSkills: {
        where: { type: "offer" },
        select: { id: true, level: true, skill: true },
      },
    },
  });

  // Students who have not verified their email are not visible to others
  if (!user || (!user.emailVerifiedAt && id !== viewerId)) {
    throw new AppError(404, "NOT_FOUND", "User not found.");
  }
  const { emailVerifiedAt, ...profile } = user;

  const [rating, openRequests] = await Promise.all([
    prisma.review.aggregate({
      where: { revieweeId: id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    id === viewerId
      ? []
      : prisma.matchRequest.findMany({
          where: {
            requesterId: viewerId,
            receiverId: id,
            status: { in: ["pending", "accepted"] },
          },
          select: { skillId: true },
        }),
  ]);

  return {
    ...profile,
    avgRating:
      rating._avg.rating === null
        ? null
        : Math.round(rating._avg.rating * 10) / 10,
    ratingCount: rating._count.rating,
    requestedSkillIds: openRequests.map((r) => r.skillId),
  };
}

export async function updateProfile(userId, data) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return publicUser(user);
}
