"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4 flex justify-between items-center">
        <Link
          href="/lesson-plan"
          className="text-2xl font-extrabold text-teal-700"
        >
          Play Plan Craft
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
              {user.user_metadata?.avatar_url && (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="User"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              )}
              <span className="text-teal-800 font-medium hidden sm:block">
                {user.user_metadata?.full_name || "Educator"}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                }}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-full text-sm shadow transition"
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
