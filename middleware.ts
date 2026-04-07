import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dynamically require the proxy so a missing AUTH_SECRET doesn't
// crash the Edge module at import time (which would 500 every page).
let _proxy: ((req: NextRequest) => unknown) | null = null;
function getProxy() {
  if (!_proxy) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      _proxy = require("@/proxy").proxy;
    } catch {
      _proxy = null;
    }
  }
  return _proxy;
}

export async function middleware(req: NextRequest) {
  if (!process.env.AUTH_SECRET) {
    // Auth not configured — pass through so the app at least loads
    return NextResponse.next();
  }
  const proxy = getProxy();
  if (!proxy) return NextResponse.next();
  try {
    return await (proxy as (req: NextRequest) => Promise<Response>)(req);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  // Exclude Next.js internals, static files, AND the NextAuth API routes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.png$).*)"],
};
