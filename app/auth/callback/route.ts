import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/onboarding";

  if (!next.startsWith("/")) {
    next = "/onboarding";
  }

  try {
    if (!code) {
      console.error("No authorization code provided");
      return NextResponse.redirect(
        `${origin}/auth/error?message=No+code+provided`
      );
    }

    const supabase = await createClient();
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (sessionError) {
      console.error("Error exchanging code for session:", sessionError.message);
      return NextResponse.redirect(
        `${origin}/auth/error?message=${encodeURIComponent(
          sessionError.message
        )}`
      );
    }

    const { data: sessionData, error: sessionCheckError } =
      await supabase.auth.getSession();

    if (sessionCheckError || !sessionData.session) {
      console.error("User session not found or invalid");
      return NextResponse.redirect(`${origin}/login`);
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(
        "Error fetching user:",
        authError?.message || "No user found"
      );
      return NextResponse.redirect(`${origin}/login`);
    }

    const { count, error: countError } = await supabase
      .from("users")
      .select("id", { count: "exact" });

    if (countError) {
      console.error("Error counting users:", countError.message);
      return NextResponse.redirect(
        `${origin}/auth/error?message=Database+error`
      );
    }

    let redirectPath = "/onboarding";

    if (count === 0) {
      const userData = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || "Admin User",
        image: user.user_metadata?.avatar_url || null,
        role: "ADMIN",
        createdAt: new Date().toISOString(),
        organizationId: null,
        pendingApproval: false,
      };

      const { error: insertError } = await supabase
        .from("users")
        .insert(userData);

      if (insertError) {
        console.error(
          "Error inserting first user as admin:",
          insertError.message
        );
        return NextResponse.redirect(
          `${origin}/auth/error?message=Failed+to+create+user&error=${encodeURIComponent(
            insertError.message
          )}`
        );
      }
      redirectPath = "/lesson-plan";
    } else {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, organizationId, pendingApproval")
        .eq("id", user.id)
        .single();

      if (userError && userError.code !== "PGRST116") {
        console.error("Error fetching user role:", userError.message);
        return NextResponse.redirect(
          `${origin}/auth/error?message=Failed+to+fetch+user+role&error=${encodeURIComponent(
            userError.message
          )}`
        );
      }

      if (!userData) {
        const newUserData = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || "New User",
          image: user.user_metadata?.avatar_url || null,
          role: null,
          createdAt: new Date().toISOString(),
          organizationId: null,
          pendingApproval: false,
        };

        const { error: insertError } = await supabase
          .from("users")
          .insert(newUserData);

        if (insertError) {
          console.error("Error inserting new user:", insertError.message);
          return NextResponse.redirect(
            `${origin}/auth/error?message=Failed+to+create+user&error=${encodeURIComponent(
              insertError.message
            )}`
          );
        }
        redirectPath = "/onboarding";
      } else {
        const { data: notifications, error: notificationError } = await supabase
          .from("notifications")
          .select("id, created_at")
          .eq("userId", user.id)
          .eq("type", "APPROVAL")
          .eq("status", "INFO")
          .gte(
            "created_at",
            new Date(Date.now() - 5 * 60 * 1000).toISOString()
          );

        if (notificationError) {
          console.error(
            "Error checking notifications:",
            notificationError.message
          );
        }

        redirectPath =
          notifications && notifications.length > 0
            ? "/notifications"
            : userData.pendingApproval
            ? "/pending-approval"
            : "/lesson-plan";
      }
    }

    const isLocalEnv = process.env.NODE_ENV === "development";
    const forwardedHost = request.headers.get("x-forwarded-host");
    const redirectUrl = isLocalEnv
      ? `${origin}${redirectPath}`
      : forwardedHost
      ? `https://${forwardedHost}${redirectPath}`
      : `${origin}${redirectPath}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    return NextResponse.redirect(
      `${origin}/auth/error?message=Unexpected+error&error=${encodeURIComponent(
        String(error)
      )}`
    );
  }
}