import { prisma } from "../lib/prisma.js";

const order = [{ dayOfWeek: "asc" }, { startTime: "asc" }];

export function getSlots(userId) {
  return prisma.availabilitySlot.findMany({
    where: { userId },
    orderBy: order,
  });
}

// Replaces all of the user's slots with the new list, in one transaction
export async function replaceSlots(userId, slots) {
  await prisma.$transaction([
    prisma.availabilitySlot.deleteMany({ where: { userId } }),
    prisma.availabilitySlot.createMany({
      data: slots.map((s) => ({ ...s, userId })),
    }),
  ]);
  return getSlots(userId);
}
