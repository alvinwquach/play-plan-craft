"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const redirectTo =
        process.env.NODE_ENV === "development"
          ? process.env.NEXT_PUBLIC_LOCAL_AUTH_CALLBACK_URL
          : process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error during Google login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-3xl font-extrabold text-teal-800 text-center mb-6">
          Sign in to PlayPlanCraft
        </h2>
        <p className="text-gray-600 text-center mb-8 text-sm">
          Use your Google account to continue
        </p>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:bg-yellow-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147.933-2.893 1.867-6.053 1.867-4.307 0-7.693-3.253-7.693-7.333s3.387-7.333 7.693-7.333c1.867 0 3.307.587 4.307 1.693l2.707-2.707C17.093 2.24 14.667 1 12.48 1 6.067 1 1 6.067 1 12.48s5.067 11.48 11.48 11.48c6.413 0 11.48-5.067 11.48-11.48v-1.48h-12.48z" />
          </svg>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}
