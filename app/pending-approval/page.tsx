"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";
import { gsap } from "gsap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PendingApproval() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [newNotification, setNewNotification] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const checkUserStatus = async (id: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("pendingApproval")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error checking user status:", error.message);
      return;
    }

    console.log("User status check:", {
      id,
      pendingApproval: data.pendingApproval,
    });

    if (!data.pendingApproval && isMountedRef.current) {
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
          theme: "colored",
        }
      );
      setTimeout(() => {
        if (isMountedRef.current) {
          router.push("/notifications");
        }
      }, 5500);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

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
        toast.error("Failed to authenticate. Redirecting to login...", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        setTimeout(() => {
          if (isMountedRef.current) {
            router.push("/login");
          }
        }, 3000);
        return;
      }

      setUserId(user.id);
      await checkUserStatus(user.id); 
    };

    fetchUserId();

    gsap.fromTo(
      ".animate-on-load",
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    );

    return () => {
      isMountedRef.current = false;
    };
  }, [router, supabase]);

  useEffect(() => {
    if (!userId || approved) return;

    if (!pollingIntervalRef.current) {
      console.log("Starting polling for user ID:", userId);
      pollingIntervalRef.current = setInterval(() => {
        console.log("Polling user status for ID:", userId);
        checkUserStatus(userId);
      }, 10000);
    }

    const userChannel = supabase
      .channel(`user-approval-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log("User UPDATE event received:", payload);
          const updatedUser = payload.new;

          if (updatedUser.pendingApproval === false && isMountedRef.current) {
            console.log("Approval detected via subscription:", updatedUser);
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
                theme: "colored",
              }
            );
            setTimeout(() => {
              if (isMountedRef.current) {
                router.push("/notifications");
              }
            }, 5500);
          }
        }
      )
      .subscribe((status, error) => {
        console.log(
          "User channel subscription status:",
          status,
          error ? `Error: ${error.message}` : ""
        );
        if (status === "CHANNEL_ERROR" && isMountedRef.current) {
          console.error("Failed to subscribe to user-approval channel");
          toast.error(
            "Error connecting to approval updates. Polling enabled.",
            {
              position: "top-center",
              autoClose: 3000,
              theme: "colored",
            }
          );
        }
      });

    const notificationChannel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          console.log("Notification INSERT event received:", payload);
          const newNotification = payload.new;
          if (newNotification.type === "APPROVAL" && isMountedRef.current) {
            console.log("Approval notification detected:", newNotification);
            setNewNotification(newNotification.message);
            setApproved(true);
            toast.info(newNotification.message, {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              theme: "colored",
            });
            setTimeout(() => {
              if (isMountedRef.current) {
                router.push("/notifications");
              }
            }, 5500);
          }
        }
      )
      .subscribe((status, error) => {
        console.log(
          "Notification channel subscription status:",
          status,
          error ? `Error: ${error.message}` : ""
        );
        if (status === "CHANNEL_ERROR" && isMountedRef.current) {
          console.error("Failed to subscribe to notifications channel");
          toast.error("Error connecting to notifications. Polling enabled.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        }
      });

    return () => {
      console.log("Cleaning up subscriptions and polling");
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      supabase.removeChannel(userChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [userId, router, supabase, approved]);

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
              your educator. You'll be notified once approved.
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