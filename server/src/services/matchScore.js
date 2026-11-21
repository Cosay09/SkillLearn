export const WEIGHTS = { skill: 0.5, rating: 0.3, availability: 0.2 };
export const NEUTRAL_RATING = 0.5; // tutors with no reviews yet are not buried

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Joins overlapping windows on the same day, so free hours are never counted twice
export function mergeSlots(slots) {
  const byDay = new Map();
  for (const slot of slots) {
    const list = byDay.get(slot.dayOfWeek) ?? [];
    list.push({
      start: toMinutes(slot.startTime),
      end: toMinutes(slot.endTime),
    });
    byDay.set(slot.dayOfWeek, list);
  }

  const merged = [];
  for (const [day, list] of byDay) {
    list.sort((a, b) => a.start - b.start);
    let current = { ...list[0] };
    for (const next of list.slice(1)) {
      if (next.start <= current.end) {
        current.end = Math.max(current.end, next.end);
      } else {
        merged.push({ day, ...current });
        current = { ...next };
      }
    }
    merged.push({ day, ...current });
  }
  return merged;
}

export function totalMinutes(merged) {
  return merged.reduce((sum, slot) => sum + (slot.end - slot.start), 0);
}

export function overlapMinutes(a, b) {
  let total = 0;
  for (const x of a) {
    for (const y of b) {
      if (x.day !== y.day) continue;
      const overlap = Math.min(x.end, y.end) - Math.max(x.start, y.start);
      if (overlap > 0) total += overlap;
    }
  }
  return total;
}

const round1 = (value) => Math.round(value * 10) / 10;

// learner:   { wantedIds: number[], slots: merged slots }
// candidate: { offeredIds: number[], slots: merged slots, avgRating: number | null, ratingCount: number }
export function scoreCandidate(learner, candidate) {
  const sharedSkillIds = learner.wantedIds.filter((id) =>
    candidate.offeredIds.includes(id),
  );
  if (sharedSkillIds.length === 0) return null; // not a candidate

  const skillPart = sharedSkillIds.length / learner.wantedIds.length;
  const ratingPart =
    candidate.ratingCount === 0 ? NEUTRAL_RATING : candidate.avgRating / 5;

  const learnerMinutes = totalMinutes(learner.slots);
  const overlap = overlapMinutes(learner.slots, candidate.slots);
  const availabilityPart =
    learnerMinutes === 0 ? 0 : Math.min(1, overlap / learnerMinutes);

  const score =
    100 *
    (WEIGHTS.skill * skillPart +
      WEIGHTS.rating * ratingPart +
      WEIGHTS.availability * availabilityPart);

  return {
    score: round1(score),
    sharedSkillIds,
    overlapHours: round1(overlap / 60),
  };
}
