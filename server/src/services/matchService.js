import { prisma } from "../lib/prisma.js";
import { mergeSlots, scoreCandidate } from "./matchScore.js";

const MAX_RESULTS = 20;

export async function findMatches(userId) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      userSkills: { where: { type: "want" }, select: { skillId: true } },
      availabilitySlots: true,
    },
  });

  const wantedIds = me.userSkills.map((s) => s.skillId);
  if (wantedIds.length === 0) return { hasWantedSkills: false, matches: [] };

  // Verified students (other than me) who offer at least one skill I want
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: userId },
      emailVerifiedAt: { not: null },
      userSkills: { some: { type: "offer", skillId: { in: wantedIds } } },
    },
    select: {
      id: true,
      name: true,
      department: true,
      year: true,
      bio: true,
      userSkills: {
        where: { type: "offer" },
        select: { skillId: true, skill: { select: { name: true } } },
      },
      availabilitySlots: true,
    },
  });
  if (candidates.length === 0) return { hasWantedSkills: true, matches: [] };

  const candidateIds = candidates.map((c) => c.id);

  const [ratingRows, openRequests] = await Promise.all([
    prisma.review.groupBy({
      by: ["revieweeId"],
      where: { revieweeId: { in: candidateIds } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    // Skills I have already asked each candidate for
    prisma.matchRequest.findMany({
      where: {
        requesterId: userId,
        receiverId: { in: candidateIds },
        status: { in: ["pending", "accepted"] },
      },
      select: { receiverId: true, skillId: true },
    }),
  ]);

  const ratings = new Map(
    ratingRows.map((row) => [
      row.revieweeId,
      { avg: row._avg.rating, count: row._count.rating },
    ]),
  );
  const requested = new Set(
    openRequests.map((r) => `${r.receiverId}:${r.skillId}`),
  );

  const learner = { wantedIds, slots: mergeSlots(me.availabilitySlots) };

  const matches = [];
  for (const c of candidates) {
    const rating = ratings.get(c.id) ?? { avg: null, count: 0 };

    const result = scoreCandidate(learner, {
      offeredIds: c.userSkills.map((s) => s.skillId),
      slots: mergeSlots(c.availabilitySlots),
      avgRating: rating.avg,
      ratingCount: rating.count,
    });
    if (!result) continue;

    matches.push({
      user: {
        id: c.id,
        name: c.name,
        department: c.department,
        year: c.year,
        bio: c.bio,
      },
      score: result.score,
      sharedSkills: c.userSkills
        .filter((s) => result.sharedSkillIds.includes(s.skillId))
        .map((s) => ({
          id: s.skillId,
          name: s.skill.name,
          requested: requested.has(`${c.id}:${s.skillId}`),
        })),
      wantedCount: wantedIds.length,
      avgRating: rating.avg === null ? null : Math.round(rating.avg * 10) / 10,
      ratingCount: rating.count,
      overlapHours: result.overlapHours,
    });
  }

  // Best score first; equal scores are ordered by name so the list never jumps around
  matches.sort(
    (a, b) => b.score - a.score || a.user.name.localeCompare(b.user.name),
  );
  return { hasWantedSkills: true, matches: matches.slice(0, MAX_RESULTS) };
}
