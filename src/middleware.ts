import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("commentiq_session")?.value;
  const login = new URL("/login", req.url);
  login.searchParams.set("next", req.nextUrl.pathname);

  if (!token) return NextResponse.redirect(login);

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return NextResponse.redirect(login);
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
