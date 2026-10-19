import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/register", "/forgot-password", "/reset-password"];

// Comprobación rápida: solo verifica que exista la cookie. La firma del JWT se valida en
// el servidor con requireTeacher().
export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has("sonya_session");
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));

  if (!hasSession && !isPublic && pathname !== "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
