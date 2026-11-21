import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

const requestInclude = {
  requester: { select: { id: true, name: true, department: true, year: true } },
  receiver: { select: { id: true, name: true, department: true, year: true } },
  skill: true,
};

export async function createRequest(requesterId, { receiverId, skillId }) {
  if (receiverId === requesterId) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "You cannot send a request to yourself.",
    );
  }

  const [requester, receiver] = await Promise.all([
    prisma.user.findUnique({
      where: { id: requesterId },
      select: { name: true },
    }),
    prisma.user.findUnique({
      where: { id: receiverId },
      select: { emailVerifiedAt: true },
    }),
  ]);
  if (!receiver || !receiver.emailVerifiedAt) {
    throw new AppError(404, "NOT_FOUND", "Student not found.");
  }

  const offered = await prisma.userSkill.findFirst({
    where: { userId: receiverId, skillId, type: "offer" },
    include: { skill: true },
  });
  if (!offered) {
    throw new AppError(
      400,
      "SKILL_NOT_OFFERED",
      "This student does not offer that skill.",
    );
  }

  // Only a pending or accepted request blocks a repeat
  const open = await prisma.matchRequest.findFirst({
    where: {
      requesterId,
      receiverId,
      skillId,
      status: { in: ["pending", "accepted"] },
    },
  });
  if (open) {
    throw new AppError(
      409,
      "REQUEST_EXISTS",
      "You already have an open request for this skill.",
    );
  }

  // The request and the notification are saved together or not at all
  const [request] = await prisma.$transaction([
    prisma.matchRequest.create({
      data: { requesterId, receiverId, skillId },
      include: requestInclude,
    }),
    prisma.notification.create({
      data: {
        userId: receiverId,
        type: "request",
        content: `${requester.name} asked you to teach ${offered.skill.name}.`,
      },
    }),
  ]);

  return request;
}

export function listRequests(userId, box) {
  const where =
    box === "outgoing" ? { requesterId: userId } : { receiverId: userId };
  return prisma.matchRequest.findMany({
    where,
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRequestStatus(userId, id, status) {
  const request = await prisma.matchRequest.findUnique({
    where: { id },
    include: requestInclude,
  });
  if (!request) {
    throw new AppError(404, "NOT_FOUND", "Request not found.");
  }

  const isRequester = request.requesterId === userId;
  const isReceiver = request.receiverId === userId;
  if (!isRequester && !isReceiver) {
    throw new AppError(403, "FORBIDDEN", "This request is not yours.");
  }

  // The tutor answers a request; the student who sent it can only cancel it
  if (status === "cancelled" && !isRequester) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "Only the student who sent a request can cancel it.",
    );
  }
  if (status !== "cancelled" && !isReceiver) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "Only the student who received a request can answer it.",
    );
  }

  const actor = isReceiver ? request.receiver : request.requester;
  const notifyUserId = isReceiver ? request.requesterId : request.receiverId;
  const content =
    status === "cancelled"
      ? `${actor.name} cancelled their request for ${request.skill.name}.`
      : `${actor.name} ${status} your request for ${request.skill.name}.`;

  return prisma.$transaction(async (tx) => {
    // Only a pending request can change; this also stops two people changing it at once
    const { count } = await tx.matchRequest.updateMany({
      where: { id, status: "pending" },
      data: { status },
    });
    if (count === 0) {
      throw new AppError(
        409,
        "NOT_PENDING",
        "This request is no longer pending.",
      );
    }

    await tx.notification.create({
      data: {
        userId: notifyUserId,
        type: status === "cancelled" ? "request" : "decision",
        content,
      },
    });

    return tx.matchRequest.findUnique({
      where: { id },
      include: requestInclude,
    });
  });
}
