import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

const sessionInclude = {
  skill: true,
  tutor: { select: { id: true, name: true, department: true, year: true } },
  learner: { select: { id: true, name: true, department: true, year: true } },
};

export async function createSession(
  userId,
  { matchRequestId, startTime, endTime, meetingInfo },
) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (end <= start) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "The end time must be after the start time.",
    );
  }
  if (start <= new Date()) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Pick a start time in the future.",
    );
  }

  const request = await prisma.matchRequest.findUnique({
    where: { id: matchRequestId },
    include: {
      skill: true,
      requester: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });
  if (!request) {
    throw new AppError(404, "NOT_FOUND", "Request not found.");
  }

  const isRequester = request.requesterId === userId;
  if (!isRequester && request.receiverId !== userId) {
    throw new AppError(403, "FORBIDDEN", "This request is not yours.");
  }
  if (request.status !== "accepted") {
    throw new AppError(
      409,
      "NOT_ACCEPTED",
      "You can book a session only after the request is accepted.",
    );
  }

  const me = isRequester ? request.requester : request.receiver;
  const otherId = isRequester ? request.receiverId : request.requesterId;
  const people = [request.requesterId, request.receiverId];

  try {
    // Serializable makes the check and the insert one unit, so two people booking at once
    // cannot both pass the check
    return await prisma.$transaction(
      async (tx) => {
        // Two time ranges overlap when each one starts before the other ends
        const clash = await tx.session.findFirst({
          where: {
            status: "scheduled",
            startTime: { lt: end },
            endTime: { gt: start },
            OR: [{ tutorId: { in: people } }, { learnerId: { in: people } }],
          },
        });
        if (clash) {
          const mine = [clash.tutorId, clash.learnerId].includes(userId);
          throw new AppError(
            409,
            "SLOT_CONFLICT",
            mine
              ? "You already have a session at this time."
              : "The other student already has a session at this time.",
          );
        }

        const session = await tx.session.create({
          data: {
            matchRequestId,
            tutorId: request.receiverId, // the student who was asked to teach
            learnerId: request.requesterId,
            skillId: request.skillId,
            startTime: start,
            endTime: end,
            meetingInfo: meetingInfo || null,
          },
          include: sessionInclude,
        });

        await tx.notification.create({
          data: {
            userId: otherId,
            type: "booking",
            content: `${me.name} booked a ${request.skill.name} session with you.`,
          },
        });

        return session;
      },
      { isolationLevel: "Serializable" },
    );
  } catch (err) {
    if (err.code === "P2034") {
      throw new AppError(
        409,
        "SLOT_CONFLICT",
        "That time was just taken. Please try again.",
      );
    }
    throw err;
  }
}

export function listSessions(userId, when) {
  const mine = { OR: [{ tutorId: userId }, { learnerId: userId }] };
  const upcoming = { status: "scheduled", endTime: { gt: new Date() } };

  return prisma.session.findMany({
    where: { AND: [mine, when === "past" ? { NOT: upcoming } : upcoming] },
    include: sessionInclude,
    orderBy: { startTime: when === "past" ? "desc" : "asc" },
  });
}

export async function updateSessionStatus(userId, id, status) {
  const session = await prisma.session.findUnique({
    where: { id },
    include: sessionInclude,
  });
  if (!session) {
    throw new AppError(404, "NOT_FOUND", "Session not found.");
  }
  if (![session.tutorId, session.learnerId].includes(userId)) {
    throw new AppError(403, "FORBIDDEN", "This session is not yours.");
  }
  if (status === "completed" && session.endTime > new Date()) {
    throw new AppError(
      400,
      "TOO_EARLY",
      "You can mark a session as completed after it ends.",
    );
  }

  const me = session.tutorId === userId ? session.tutor : session.learner;
  const otherId =
    session.tutorId === userId ? session.learnerId : session.tutorId;

  return prisma.$transaction(async (tx) => {
    // Only a scheduled session can change; this also stops two people changing it at once
    const { count } = await tx.session.updateMany({
      where: { id, status: "scheduled" },
      data: { status },
    });
    if (count === 0) {
      throw new AppError(
        409,
        "NOT_SCHEDULED",
        "This session can no longer be changed.",
      );
    }

    if (status === "cancelled") {
      await tx.notification.create({
        data: {
          userId: otherId,
          type: "booking",
          content: `${me.name} cancelled the ${session.skill.name} session.`,
        },
      });
    }

    return tx.session.findUnique({ where: { id }, include: sessionInclude });
  });
}
