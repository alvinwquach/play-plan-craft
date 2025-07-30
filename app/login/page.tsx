"use client";

import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-3xl font-extrabold text-teal-800 text-center mb-4">
          Sign in to Play Plan Craft
        </h2>
        <p className="text-gray-600 text-center mb-6 text-sm">
          Continue with Google
        </p>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-60"
        >
          <FaGoogle className="w-5 h-5" />
          {loading ? "Signing in with Google..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}
