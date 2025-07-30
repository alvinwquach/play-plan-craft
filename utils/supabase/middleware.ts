import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const protectedRoutes = ["/lesson-plan", "/calendar", "/notifications"];
    const publicRoutes = [
      "/login",
      "/auth",
      "/auth/callback",
      "/auth/error",
      "/onboarding",
      "/",
    ];

    const isPublicRoute = publicRoutes.some(
      (route) =>
        request.nextUrl.pathname.startsWith(route) ||
        request.nextUrl.pathname === route
    );

    if (isPublicRoute) {
      console.log(`Allowing public route: ${request.nextUrl.pathname}`);
      return supabaseResponse;
    }

    const isProtectedRoute = protectedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
      console.log(`Allowing non-protected route: ${request.nextUrl.pathname}`);
      return supabaseResponse;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (!session || sessionError) {
      console.error(
        `No session found for protected route ${request.nextUrl.pathname}:`,
        sessionError?.message
      );
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(
        `No user found for protected route ${request.nextUrl.pathname}:`,
        authError?.message
      );
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }

    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError && roleError.code !== "PGRST116") {
      console.error(
        `Error querying users table for ${request.nextUrl.pathname}:`,
        roleError.message
      );
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (!userData?.role) {
      console.log(
        `User has no role, redirecting to onboarding from ${request.nextUrl.pathname}`
      );
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error(
      `Unexpected middleware error for ${request.nextUrl.pathname}:`,
      error
    );
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};