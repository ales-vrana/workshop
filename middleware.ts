import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function unauthorized(): NextResponse {
  return new NextResponse("Workshop Engine — přihlášení vyžadováno", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Workshop Engine"',
      "Cache-Control": "no-store",
    },
  });
}

function checkBasicAuth(header: string | null): boolean {
  const password = process.env.ENGINE_PASSWORD;
  if (!password) return false;
  if (!header || !header.startsWith("Basic ")) return false;
  try {
    const decoded = atob(header.slice(6));
    const colon = decoded.indexOf(":");
    if (colon < 0) return false;
    const user = decoded.slice(0, colon);
    const pass = decoded.slice(colon + 1);
    const expectedUser = process.env.ENGINE_USER || "engine";
    return user === expectedUser && pass === password;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  if (!process.env.ENGINE_PASSWORD) {
    return new NextResponse(
      "ENGINE_PASSWORD není nastavené. Doplň ho v .env.local / Vercel a restartuj.",
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!checkBasicAuth(request.headers.get("authorization"))) {
    return unauthorized();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/engine/:path*", "/api/engine/:path*"],
};
