import { prisma } from "../src/lib/prisma.js";

// Past, completed tutoring between demo students, so that ratings exist.
// Rafi is left out on purpose, so his requests can be tried by hand.
const history = [
  {
    student: "imran@example.com",
    tutor: "nadia@example.com",
    skill: "Python",
    ratings: [5, 4],
  },
  {
    student: "nadia@example.com",
    tutor: "sadia@example.com",
    skill: "Python",
    ratings: [5],
  },
];

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  for (const item of history) {
    const [student, tutor, skill] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { email: item.student } }),
      prisma.user.findUniqueOrThrow({ where: { email: item.tutor } }),
      prisma.skill.findUniqueOrThrow({ where: { name: item.skill } }),
    ]);

    // Remove an earlier run of this script so it can be repeated safely
    const old = await prisma.matchRequest.findMany({
      where: {
        requesterId: student.id,
        receiverId: tutor.id,
        skillId: skill.id,
      },
      select: { id: true },
    });
    const oldIds = old.map((r) => r.id);
    await prisma.review.deleteMany({
      where: { session: { matchRequestId: { in: oldIds } } },
    });
    await prisma.session.deleteMany({
      where: { matchRequestId: { in: oldIds } },
    });
    await prisma.matchRequest.deleteMany({ where: { id: { in: oldIds } } });

    const request = await prisma.matchRequest.create({
      data: {
        requesterId: student.id,
        receiverId: tutor.id,
        skillId: skill.id,
        status: "accepted",
      },
    });

    for (const [i, rating] of item.ratings.entries()) {
      const start = new Date(Date.now() - (i + 2) * 7 * DAY);
      const session = await prisma.session.create({
        data: {
          matchRequestId: request.id,
          tutorId: tutor.id,
          learnerId: student.id,
          skillId: skill.id,
          startTime: start,
          endTime: new Date(start.getTime() + 60 * 60 * 1000),
          status: "completed",
        },
      });
      await prisma.review.create({
        data: {
          sessionId: session.id,
          reviewerId: student.id,
          revieweeId: tutor.id,
          rating,
        },
      });
    }
  }

  console.log(
    "Demo ratings ready: Nadia 4.5 (2 reviews), Sadia 5.0 (1 review)",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
