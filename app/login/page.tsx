"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { FaGoogle, FaFacebookF, FaTwitter, FaDiscord } from "react-icons/fa";
import type { Provider } from "@supabase/supabase-js";

const providers: {
  name: string;
  icon: React.ElementType;
  provider: Provider;
}[] = [
  { name: "Google", icon: FaGoogle, provider: "google" },
  { name: "Facebook", icon: FaFacebookF, provider: "facebook" },
  { name: "Twitter", icon: FaTwitter, provider: "twitter" },
  { name: "Discord", icon: FaDiscord, provider: "discord" },
];

export default function Login() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const supabase = createClient();

  const handleOAuthLogin = async (provider: Provider) => {
    setLoadingProvider(provider);
    try {
      const redirectTo =
        process.env.NODE_ENV === "development"
          ? process.env.NEXT_PUBLIC_LOCAL_AUTH_CALLBACK_URL
          : process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
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
      console.error(`Error during ${provider} login:`, error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-3xl font-extrabold text-teal-800 text-center mb-4">
          Sign in to Play Plan Craft
        </h2>
        <p className="text-gray-600 text-center mb-6 text-sm">
          Continue using one of your social accounts
        </p>

        <div className="space-y-3">
          {providers.map(({ name, icon: Icon, provider }) => (
            <button
              key={provider}
              onClick={() => handleOAuthLogin(provider)}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-60"
            >
              <Icon className="w-5 h-5" />
              {loadingProvider === provider
                ? `Signing in with ${name}...`
                : `Sign in with ${name}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
