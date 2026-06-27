import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Si ya tiene locale, continuar
  if (pathname.startsWith("/es") || pathname.startsWith("/en")) {
    return NextResponse.next();
  }
  
  // Redirigir a /es por defecto
  return NextResponse.redirect(new URL(`/es${pathname}`, request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};