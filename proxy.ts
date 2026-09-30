import { NextResponse, type NextRequest } from "next/server";
import { hasLocale, pickLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (hasLocale(first)) return;

  const locale = pickLocale(request.headers.get("accept-language"));
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Excluye _next, api y cualquier archivo con extensión (imágenes, sitemap.xml, robots.txt…).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
