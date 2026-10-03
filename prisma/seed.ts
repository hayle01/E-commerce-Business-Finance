import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const personal = ["Family Support", "Transport", "Breakfast", "Lunch", "Dinner", "University", "Family Bills", "Gym", "Leisure", "Personal Shopping", "Other"];
const business = ["Advertising", "Delivery", "Fuel", "Packaging", "Business Transport", "Mobile/Data", "Platform Fees", "Business Meals", "Other"];
const income = ["Freelance", "Gifts", "Commission", "Side Work", "Other"];

async function main() {
  let order = 0;
  for (const name of personal) {
    await prisma.category.create({ data: { name, type: "EXPENSE", expenseKind: "PERSONAL", sortOrder: order++ } });
  }
  order = 0;
  for (const name of business) {
    await prisma.category.create({ data: { name, type: "EXPENSE", expenseKind: "BUSINESS", sortOrder: order++ } });
  }
  order = 0;
  for (const name of income) {
    await prisma.category.create({ data: { name, type: "INCOME", sortOrder: order++ } });
  }
  await prisma.category.create({ data: { name: "General", type: "PRODUCT", sortOrder: 0 } });
  console.log("Seeded categories.");
}

main().finally(() => prisma.$disconnect());
