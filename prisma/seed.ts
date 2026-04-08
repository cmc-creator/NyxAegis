import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding NyxAegis...");

  const adminPw = await bcrypt.hash("Soldier10!", 10);

  // Only seed the admin account — all real data is entered by live users.
  await prisma.user.upsert({
    where:  { email: "admin@nyxaegis.com" },
    update: {
      email: "admin@nyxaegis.com",
      name: "NyxAegis Admin",
      password: adminPw,
      role: "ADMIN",
    },
    create: {
      email:    "admin@nyxaegis.com",
      name:     "NyxAegis Admin",
      password: adminPw,
      role:     "ADMIN",
    },
  });

  console.log("Seed complete.");
  console.log("  Login: admin@nyxaegis.com / Soldier10!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
