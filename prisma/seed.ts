import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Destiny Springs CRM...");

  const adminPw = await bcrypt.hash("admin123!", 10);

  // Only seed the admin account — all real data is entered by live users.
  await prisma.user.upsert({
    where:  { email: "admin@destinysprings.com" },
    update: {},
    create: {
      email:    "admin@destinysprings.com",
      name:     "Destiny Springs Admin",
      password: adminPw,
      role:     "ADMIN",
    },
  });

  console.log("Seed complete.");
  console.log("  Login: admin@destinysprings.com / admin123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
