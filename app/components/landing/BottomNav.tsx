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

export default function BottomNav() {
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = useState(0);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("userId", user.id)
      .eq("status", "PENDING");

    if (!error && typeof count === "number") {
      setNotificationCount(count);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notification-count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, supabase]);

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
