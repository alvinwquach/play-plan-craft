"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error checking session:", sessionError);
        return;
      }
      if (!session) {
        router.push("/login");
      } else {
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (error) {
          console.error("Error checking user role in onboarding:", error);
        } else if (userData?.role) {
          router.push("/");
        }
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleRoleSelection = async (role: "EDUCATOR" | "ASSISTANT") => {
    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error fetching user in onboarding:", userError);
      setLoading(false);
      return;
    }
    if (user) {
      const { error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", user.id);
      if (error) {
        console.error("Error updating role:", error);
      } else {
        router.push("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to PlayPlanCraft</h1>
        <p className="mb-4">Please choose your role to continue:</p>
        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelection("EDUCATOR")}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Educator
          </button>
          <button
            onClick={() => handleRoleSelection("ASSISTANT")}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Assistant
          </button>
        </div>
      </div>
    </div>
  );
}
