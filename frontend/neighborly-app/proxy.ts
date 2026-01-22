import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // 1. Check if the user has the "wristband" (cookie)
  const token = request.cookies.get("session_token")?.value;

  // 2. Define which paths are protected
  // If they are on a dashboard page...
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // ...and they don't have a token...
    if (!token) {
      // ...kick them back to login!
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. Allow them to proceed
  return NextResponse.next();
}

// Optimization: Only run this on specific paths
export const config = {
  matcher: ["/dashboard/:path*"],
};
