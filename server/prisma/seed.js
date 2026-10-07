import { prisma } from "../src/lib/prisma.js";

const skills = [
  { name: "Python", category: "Programming" },
  { name: "Java", category: "Programming" },
  { name: "C", category: "Programming" },
  { name: "C++", category: "Programming" },
  { name: "JavaScript", category: "Programming" },
  { name: "SQL", category: "Programming" },
  { name: "Data Structures", category: "Computer Science" },
  { name: "Algorithms", category: "Computer Science" },
  { name: "Machine Learning", category: "Computer Science" },
  { name: "Figma", category: "Design" },
  { name: "UI/UX Design", category: "Design" },
  { name: "Public Speaking", category: "Soft Skills" },
  { name: "Technical Writing", category: "Soft Skills" },
  { name: "English Speaking", category: "Language" },
];

async function main() {
  await prisma.skill.createMany({ data: skills, skipDuplicates: true });
  const count = await prisma.skill.count();
  console.log(`Seed done. Skills in database: ${count}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
