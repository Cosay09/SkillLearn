/*
    Sayed push korbe
*/

import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

// Development only. Every demo student logs in with this password.
const PASSWORD = "password123";

// Slots are [dayOfWeek, start, end]; 0 = Sunday
const rafiSlots = [
  [6, "10:00", "12:00"],
  [1, "16:00", "18:00"],
  [3, "16:00", "18:00"],
  [4, "14:00", "18:00"],
];

const people = [
  {
    name: "Rafi Ahmed",
    email: "rafi@example.com",
    year: 3,
    bio: "Wants to get better at Python, SQL and Figma.",
    offer: [],
    want: ["Python", "SQL", "Figma"],
    slots: rafiSlots,
  },
  {
    name: "Nadia Rahman",
    email: "nadia@example.com",
    year: 4,
    bio: "Enjoys explaining databases and Python basics.",
    offer: [
      ["Python", "advanced"],
      ["SQL", "intermediate"],
    ],
    want: ["Public Speaking"],
    slots: [
      [6, "10:00", "12:00"],
      [1, "16:00", "18:00"],
      [3, "16:00", "18:00"],
      [0, "12:00", "14:00"],
    ],
  },
  {
    name: "Imran Hossain",
    email: "imran@example.com",
    year: 3,
    bio: "Design and code, mostly in the evenings.",
    offer: [
      ["Python", "intermediate"],
      ["SQL", "intermediate"],
      ["Figma", "advanced"],
    ],
    want: ["Machine Learning"],
    slots: [
      [4, "16:00", "18:00"],
      [2, "10:00", "12:00"],
    ],
  },
  {
    name: "Sadia Akter",
    email: "sadia@example.com",
    year: 2,
    bio: "Learning Python and happy to help beginners.",
    offer: [["Python", "beginner"]],
    want: ["UI/UX Design"],
    slots: rafiSlots,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const skills = await prisma.skill.findMany();

  const skillId = (name) => {
    const skill = skills.find((s) => s.name === name);
    if (!skill)
      throw new Error(`Skill "${name}" not found. Run: node prisma/seed.js`);
    return skill.id;
  };

  for (const p of people) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { name: p.name, year: p.year, bio: p.bio, department: "CSE" },
      create: {
        name: p.name,
        email: p.email,
        passwordHash,
        year: p.year,
        bio: p.bio,
        department: "CSE",
      },
    });

    // Replace skills and free times so the script can be run again safely
    await prisma.userSkill.deleteMany({ where: { userId: user.id } });
    await prisma.availabilitySlot.deleteMany({ where: { userId: user.id } });

    await prisma.userSkill.createMany({
      data: [
        ...p.offer.map(([name, level]) => ({
          userId: user.id,
          skillId: skillId(name),
          type: "offer",
          level,
        })),
        ...p.want.map((name) => ({
          userId: user.id,
          skillId: skillId(name),
          type: "want",
        })),
      ],
    });

    await prisma.availabilitySlot.createMany({
      data: p.slots.map(([dayOfWeek, startTime, endTime]) => ({
        userId: user.id,
        dayOfWeek,
        startTime,
        endTime,
      })),
    });
  }

  console.log(`Demo students ready: ${people.map((p) => p.email).join(", ")}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
