import { type DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role; verified?: boolean; } & DefaultSession["user"];
  }
  interface User { role: Role; verified?: boolean; }
}

declare module "next-auth/jwt" {
  interface JWT { role: Role; id: string; verified?: boolean; }
}
