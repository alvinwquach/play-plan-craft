import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";

  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        console.error("Error fetching user in callback:", authError);
      }
      if (user) {
        console.log("User ID in callback:", user.id);

        const { count, error: countError } = await supabase
          .from("users")
          .select("id", { count: "exact" });

        if (countError) {
          console.error("Error counting users in callback:", countError);
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
          };
          console.log("Inserting first user:", userData);
          const { error: insertError } = await supabase
            .from("users")
            .insert(userData);

          if (insertError) {
            console.error("Error inserting first user as admin:", insertError);
          }

          console.log("✅ First user created and assigned ADMIN role:", {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name,
            image: user.user_metadata?.avatar_url || null,
          });

          redirectPath = "/lesson-plan";
        } else {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (userError && userError.code !== "PGRST116") {
            console.error("Error fetching user role in callback:", userError);
          }

          if (!userData) {
            const newUserData = {
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.full_name || "New User",
              image: user.user_metadata?.avatar_url || null,
              createdAt: new Date().toISOString(),
              organizationId: null,
            };
            console.log("Inserting new user:", newUserData);
            const { error: insertError } = await supabase
              .from("users")
              .insert(newUserData);

            if (insertError) {
              console.error("Error inserting new user:", insertError);
            }

            console.log("✅ New user created (non-admin):", {
              id: user.id,
              email: user.email,
            });
          } else if (userData.role) {
            console.log("✅ Existing user with role:", userData.role);
            redirectPath = "/lesson-plan";
          }
        }

        console.log("Redirecting to:", redirectPath);
        const isLocalEnv = process.env.NODE_ENV === "development";
        const forwardedHost = request.headers.get("x-forwarded-host");

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectPath}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(
            `https://${forwardedHost}${redirectPath}`
          );
        } else {
          return NextResponse.redirect(`${origin}${redirectPath}`);
        }
      }
    }
    console.error("Error exchanging code for session:", error);
  }
}
