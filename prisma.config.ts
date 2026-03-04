import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRIVATE_URL;

if (!databaseUrl) {
  console.error(
    "[prisma.config.ts] ERROR: No database URL found. " +
      "Set DATABASE_URL in Railway Variables (link the Postgres service)."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl!,
  },
});
