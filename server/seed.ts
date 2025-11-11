import { db } from "./db";
import { boards, levels, subjects } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const [gcseLevel] = await db.insert(levels).values({ name: "GCSE" }).returning();
  const [aLevel] = await db.insert(levels).values({ name: "A-Level" }).returning();

  const boardsList = [
    { name: "AQA", slug: "aqa" },
    { name: "Edexcel", slug: "edexcel" },
    { name: "OCR", slug: "ocr" },
    { name: "WJEC", slug: "wjec" },
    { name: "CCEA", slug: "ccea" },
  ];

  const createdBoards = await db.insert(boards).values(boardsList).returning();

  const subjectsList = [
    { name: "Mathematics", levelId: gcseLevel.id },
    { name: "English Language", levelId: gcseLevel.id },
    { name: "English Literature", levelId: gcseLevel.id },
    { name: "Biology", levelId: gcseLevel.id },
    { name: "Chemistry", levelId: gcseLevel.id },
    { name: "Physics", levelId: gcseLevel.id },
    { name: "Combined Science", levelId: gcseLevel.id },
    { name: "Mathematics", levelId: aLevel.id },
    { name: "Biology", levelId: aLevel.id },
    { name: "Chemistry", levelId: aLevel.id },
    { name: "Physics", levelId: aLevel.id },
    { name: "English Language", levelId: aLevel.id },
    { name: "English Literature", levelId: aLevel.id },
    { name: "Psychology", levelId: aLevel.id },
    { name: "Business", levelId: aLevel.id },
  ];

  await db.insert(subjects).values(subjectsList).returning();

  console.log("Database seeded successfully!");
  console.log(`Created ${boardsList.length} boards`);
  console.log(`Created 2 levels`);
  console.log(`Created ${subjectsList.length} subjects`);
}

seed().catch(console.error).finally(() => process.exit());
