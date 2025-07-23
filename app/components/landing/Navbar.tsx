"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-sm shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-2xl font-bold text-teal-800">
            Play Plan Craft
          </span>
        </div>
        {!loading && (
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.user_metadata?.avatar_url && (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="User profile"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                )}
                <span className="text-teal-800 font-semibold">
                  {user.user_metadata?.full_name || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-teal-400 text-white hover:bg-teal-500 px-4 py-2 rounded-full text-sm font-semibold transition shadow-md hover:shadow-lg"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-white border border-teal-400 text-teal-600 hover:bg-teal-100 px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm hover:shadow-md"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="bg-teal-400 text-white hover:bg-teal-500 px-4 py-2 rounded-full text-sm font-semibold transition shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
