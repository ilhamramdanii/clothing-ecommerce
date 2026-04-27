import { NextRequest, NextResponse } from "next/server";

const adminProtectedPrefix = "/admin";
const adminLoginPath = "/admin/login";

// Route customer yang butuh login
const customerProtectedPrefixes = [
  "/account/profile",
  "/account/addresses",
  "/orders",
  "/checkout",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const adminSession = req.cookies.get("admin_session");
  const customerSession = req.cookies.get("customer_session");

  // ── ADMIN ──────────────────────────────────────────
  // Sudah login tapi akses halaman login → redirect ke dashboard
  if (pathname === adminLoginPath && adminSession) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Belum login tapi akses admin panel → redirect ke login
  if (pathname.startsWith(adminProtectedPrefix) && pathname !== adminLoginPath && !adminSession) {
    return NextResponse.redirect(new URL(adminLoginPath, req.url));
  }

  // ── CUSTOMER ───────────────────────────────────────
  // Belum login tapi akses halaman yang butuh autentikasi → redirect ke login
  const needsCustomerAuth = customerProtectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (needsCustomerAuth && !customerSession) {
    const loginUrl = new URL("/account/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/profile", "/account/addresses", "/orders/:path*", "/checkout/:path*"],
};
