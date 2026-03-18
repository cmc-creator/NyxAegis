export const BRAND = {
  name:    process.env.NEXT_PUBLIC_ORG_NAME    ?? "Destiny Springs",
  website: process.env.NEXT_PUBLIC_ORG_WEBSITE ?? "https://destinysprings.com",
  email:   process.env.NEXT_PUBLIC_ORG_EMAIL   ?? "ops@destinysprings.com",
  tagline: process.env.NEXT_PUBLIC_ORG_TAGLINE ?? "Hospital BD Platform",
  year: "2026",
  legalEntity: "Destiny Springs",
  copyright: "© 2026 Destiny Springs. All rights reserved.",
} as const;

export const SERVER_BRAND = {
  name:    process.env.ORG_NAME    ?? process.env.NEXT_PUBLIC_ORG_NAME    ?? "Destiny Springs",
  website: process.env.ORG_WEBSITE ?? process.env.NEXT_PUBLIC_ORG_WEBSITE ?? "https://destinysprings.com",
  email:   process.env.ORG_EMAIL   ?? process.env.ADMIN_EMAIL              ?? "ops@destinysprings.com",
} as const;
