export const BRAND = {
  name:    process.env.NEXT_PUBLIC_ORG_NAME    ?? "NyxAegis",
  website: process.env.NEXT_PUBLIC_ORG_WEBSITE ?? "https://nyxaegis.com",
  email:   process.env.NEXT_PUBLIC_ORG_EMAIL   ?? "ops@nyxaegis.com",
  tagline: process.env.NEXT_PUBLIC_ORG_TAGLINE ?? "Hospital BD Platform",
  year: "2026",
  legalEntity: "NyxAegis",
  copyright: "© 2026 NyxAegis. All rights reserved.",
} as const;

export const SERVER_BRAND = {
  name:    process.env.ORG_NAME    ?? process.env.NEXT_PUBLIC_ORG_NAME    ?? "NyxAegis",
  website: process.env.ORG_WEBSITE ?? process.env.NEXT_PUBLIC_ORG_WEBSITE ?? "https://nyxaegis.com",
  email:   process.env.ORG_EMAIL   ?? process.env.ADMIN_EMAIL              ?? "ops@nyxaegis.com",
} as const;
