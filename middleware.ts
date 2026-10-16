import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login";
  const isPortalRoute = path.startsWith("/portal");
  const isPortalAuth = path === "/portal/login" || path === "/portal/signup";
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const email = user?.email?.toLowerCase();

  if (isAdminRoute && !isAdminLogin) {
    if (!user || email !== adminEmail) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  if (isAdminLogin && email && email === adminEmail) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (isPortalRoute && !isPortalAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/login";
    return NextResponse.redirect(url);
  }

  if (isPortalAuth && user && email !== adminEmail) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
