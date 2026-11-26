import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

const person = { id: true, name: true, department: true, year: true };

async function assertOpenChat(userId, requestId) {
  const request = await prisma.matchRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) {
    throw new AppError(404, "NOT_FOUND", "Conversation not found.");
  }
  if (request.requesterId !== userId && request.receiverId !== userId) {
    throw new AppError(403, "FORBIDDEN", "This conversation is not yours.");
  }
  if (request.status !== "accepted") {
    throw new AppError(
      409,
      "NOT_ACCEPTED",
      "Chat opens after a request is accepted.",
    );
  }
}

export async function listConversations(userId) {
  const requests = await prisma.matchRequest.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    include: {
      requester: { select: person },
      receiver: { select: person },
      skill: true,
      messages: { orderBy: { id: "desc" }, take: 1 },
      _count: {
        select: {
          messages: { where: { senderId: { not: userId }, readAt: null } },
        },
      },
    },
  });

  return requests
    .map((r) => {
      const last = r.messages[0] ?? null;
      return {
        requestId: r.id,
        other: r.requesterId === userId ? r.receiver : r.requester,
        skill: r.skill,
        lastMessage: last && {
          body: last.body,
          createdAt: last.createdAt,
          senderId: last.senderId,
        },
        unread: r._count.messages,
        sortAt: last ? last.createdAt : r.createdAt,
      };
    })
    .sort((a, b) => b.sortAt - a.sortAt)
    .map(({ sortAt, ...conversation }) => conversation);
}

// `after` is the id of the newest message the page already has (the polling cursor)
export async function listMessages(userId, requestId, after) {
  await assertOpenChat(userId, requestId);

  // shortcut: the first load shows the latest 100 messages, no "load older" yet
  const messages = after
    ? await prisma.message.findMany({
        where: { matchRequestId: requestId, id: { gt: after } },
        orderBy: { id: "asc" },
        take: 200,
      })
    : (
        await prisma.message.findMany({
          where: { matchRequestId: requestId },
          orderBy: { id: "desc" },
          take: 100,
        })
      ).reverse();

  // Opening the conversation counts as reading what the other student sent
  await prisma.message.updateMany({
    where: {
      matchRequestId: requestId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return messages;
}

export async function createMessage(userId, { matchRequestId, body }) {
  await assertOpenChat(userId, matchRequestId);
  return prisma.message.create({
    data: { matchRequestId, senderId: userId, body },
  });
}
