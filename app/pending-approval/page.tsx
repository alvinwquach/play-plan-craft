"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";
import { gsap } from "gsap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PendingApproval() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [newNotification, setNewNotification] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error(
          "Error fetching user:",
          error?.message || "No user found"
        );
        router.push("/login");
        return;
      }

      setUserId(user.id);
    };

    fetchUserId();

    gsap.fromTo(
      ".animate-on-load",
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    );
  }, [router, supabase]);

  useEffect(() => {
    if (!userId) return;

    const userChannel = supabase
      .channel("user-approval")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const updatedUser = payload.new;

          if (!updatedUser.pendingApproval) {
            setApproved(true);
            toast.success(
              "🎉 You've been approved! Redirecting to notifications...",
              {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
                theme: "colored",
              }
            );

            setTimeout(() => {
              router.push("/notifications");
            }, 5500);
          }
        }
      )
      .subscribe();

    const notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new;
          if (newNotification.type === "APPROVAL") {
            setNewNotification(newNotification.message);
            toast.info(newNotification.message, {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              theme: "colored",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [userId, router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-on-load text-center">
        {!approved ? (
          <>
            <FaSpinner className="text-4xl text-teal-500 mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-teal-800 mb-4">
              Awaiting Approval
            </h1>
            <p className="text-gray-600 mb-6">
              Your request to join the organization is pending approval from
              your educator. You&apos;ll be notified once approved.
            </p>
            <button
              onClick={handleLogout}
              className="bg-gray-300 text-gray-800 py-3 px-6 rounded-full font-semibold hover:bg-gray-400 transition-all duration-300"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <FaCheckCircle className="text-4xl text-green-500 mb-4 animate-bounce" />
            <h1 className="text-2xl font-bold text-green-700 mb-4">
              Approved!
            </h1>
            {newNotification && (
              <p className="text-gray-600 mb-4">{newNotification}</p>
            )}
            <p className="text-gray-600 mb-2">
              Redirecting to notifications...
            </p>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
