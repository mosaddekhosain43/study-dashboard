import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface TokenUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  batchId: number | null;
}

function parseSessionToken(token: string): TokenUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const base64Url = parts[0];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const jsonStr = atob(base64);
    const user = JSON.parse(jsonStr);
    if (user && typeof user.id === "number" && user.role) {
      return user as TokenUser;
    }
    return null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("alim_session")?.value;
  const user = token ? parseSessionToken(token) : null;

  const isAuthPage = pathname === "/login" || pathname === "/register";

  // 1. Unauthenticated users: must be redirected to /login unless on /login or /register
  if (!user) {
    if (!isAuthPage) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Authenticated users trying to access /login or /register: redirect to their respective home
  if (isAuthPage) {
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (user.role === "teacher") {
      return NextResponse.redirect(new URL("/teacher", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Role-based routing:
  // Admin only on /admin
  if (pathname.startsWith("/admin") && user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Teacher or Admin on /teacher
  if (pathname.startsWith("/teacher") && user.role !== "teacher" && user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Admin navigating to root "/" gets redirected to /admin
  if (pathname === "/" && user.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Teacher navigating to root "/" gets redirected to /teacher
  if (pathname === "/" && user.role === "teacher") {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, sw.js, static icons
     */
    "/((?!api|_next/static|_next/image|manifest\\.json|favicon\\.ico|icon-.*\\.png).*)",
  ],
};
