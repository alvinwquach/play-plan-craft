"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { FaHome, FaClipboardList, FaCalendarAlt, FaBell } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

type BottomNavClientProps = {
  notificationCount: number; 
};

export default function BottomNavClient({
  notificationCount: initialNotificationCount,
}: BottomNavClientProps) {
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = useState(
    initialNotificationCount
  );
  const [subscribed, setSubscribed] = useState(false);
  const supabase = createClient();

  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchNotificationCount = useCallback(async () => {
    console.log("Fetching notification count for BottomNavClient");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(
        "No user found for fetching notifications:",
        authError?.message
      );
      setNotificationCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("userId", user.id)
      .in("status", ["PENDING", "INFO"]); 

    if (error) {
      console.error("Error fetching notification count:", error.message);
      setNotificationCount(0);
      return;
    }

    console.log("Notification count fetched:", count);
    setNotificationCount(count || 0);
  }, [supabase]);

  const debouncedFetchNotificationCount = useCallback(
    debounce(fetchNotificationCount, 500),
    [fetchNotificationCount]
  );

  useEffect(() => {
    const setupSubscription = async () => {
      if (subscribed) return null;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("No user found for subscription:", authError?.message);
        setNotificationCount(0);
        return null;
      }

      await fetchNotificationCount();

      const channel: RealtimeChannel = supabase
        .channel(`notification-count-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `userId=eq.${user.id}`,
          },
          (payload) => {
            console.log("INSERT event received:", payload);
            if (["PENDING", "INFO"].includes(payload.new.status)) {
              debouncedFetchNotificationCount();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `userId=eq.${user.id}`,
          },
          (payload) => {
            console.log("UPDATE event received:", payload);
            if (
              ["PENDING", "INFO"].includes(payload.new.status) ||
              ["PENDING", "INFO"].includes(payload.old.status)
            ) {
              debouncedFetchNotificationCount();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "notifications",
            filter: `userId=eq.${user.id}`,
          },
          (payload) => {
            console.log("DELETE event received:", payload);
            if (["PENDING", "INFO"].includes(payload.old.status)) {
              debouncedFetchNotificationCount();
            }
          }
        )
        .subscribe((status, error) => {
          console.log(
            "Notification subscription status:",
            status,
            error ? `Error: ${error.message}` : ""
          );
          setSubscribed(status === "SUBSCRIBED");
          if (error) {
            console.error("Subscription error:", error.message);
            debouncedFetchNotificationCount(); 
          }
        });

      return channel;
    };

    let channel: RealtimeChannel | null = null;
    setupSubscription().then((ch) => {
      channel = ch;
    });

    return () => {
      console.log("Cleaning up notification subscription");
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [debouncedFetchNotificationCount, supabase, subscribed]);

  const navItems = [
    { href: "/", label: "Home", icon: FaHome },
    { href: "/lesson-plan", label: "Plan", icon: FaClipboardList },
    { href: "/calendar", label: "Calendar", icon: FaCalendarAlt },
    { href: "/notifications", label: "Notifications", icon: FaBell },
  ];

  return (
    <TooltipProvider>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-md flex justify-around items-center h-16 z-50 relative">
        {navItems.map(({ href, label, icon: Icon }, idx) => {
          const isActive = pathname === href;
          const isNotifications = href === "/notifications";

          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={`relative flex flex-col items-center justify-center text-xs font-medium transition-colors px-6 min-w-[64px] ${
                    isActive
                      ? "text-teal-600"
                      : "text-gray-500 hover:text-teal-500"
                  }`}
                >
                  {idx < navItems.length - 1 && (
                    <div
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 h-10 border-r border-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative">
                    <Icon className="text-2xl mb-1" />
                    {isNotifications && notificationCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        {notificationCount}
                      </span>
                    )}
                  </div>
                  <span className="sr-only">{label}</span>
                  {isActive && (
                    <div
                      className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-teal-500 shadow-lg"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
