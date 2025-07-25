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
import { User } from "@supabase/supabase-js";
import { NotificationPayload } from "@/app/types/lessonPlan";

type NavClientProps = {
  notificationCount: number;
};

export default function NavClient({
  notificationCount: initialNotificationCount,
}: NavClientProps) {
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = useState(
    initialNotificationCount
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  const debounce = <T extends (...args: unknown[]) => void>(
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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setNotificationCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("userId", user.id)
      .in("status", ["PENDING", "INFO"]);

    if (error) {
      setNotificationCount(0);
      return;
    }

    setNotificationCount(count || 0);
  }, [supabase]);

  const debouncedFetchNotificationCount = useCallback(
    () => debounce(fetchNotificationCount, 500)(),
    [fetchNotificationCount]
  );

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      setUser(user);

      if (error || !user) {
        setNotificationCount(0);
        return;
      }

      await fetchNotificationCount();

      const channel = supabase
        .channel(`notification-count-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `userId=eq.${user.id}`,
          },
          (payload: NotificationPayload) => {
            const newStatus = payload.new?.status;
            const oldStatus = payload.old?.status;

            if (
              ["PENDING", "INFO"].includes(newStatus || "") ||
              ["PENDING", "INFO"].includes(oldStatus || "")
            ) {
              debouncedFetchNotificationCount();
            }
          }
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            setIsSubscribed(true);
          } else {
            setIsSubscribed(false);
          }

          if (err) {
            setIsSubscribed(false);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchAndSubscribe();
  }, [debouncedFetchNotificationCount, fetchNotificationCount, supabase]);

  if (!user) return null;

  const navItems = [
    { href: "/", label: "Home", icon: FaHome },
    { href: "/lesson-plan", label: "Plan", icon: FaClipboardList },
    { href: "/calendar", label: "Calendar", icon: FaCalendarAlt },
    { href: "/notifications", label: "Notifications", icon: FaBell },
  ];

  return (
    <TooltipProvider>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-16 z-50">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const isNotifications = href === "/notifications";

          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={`relative flex flex-col items-center justify-center text-xs font-medium px-4 transition-all duration-200 ${
                    isActive
                      ? "text-teal-600"
                      : "text-gray-500 hover:text-teal-600"
                  }`}
                >
                  <div className="relative">
                    <Icon className="text-2xl" />
                    {isNotifications && notificationCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                        {notificationCount}
                      </span>
                    )}
                  </div>
                  <span className="mt-1">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-20 bg-white border-r border-gray-200 shadow-lg flex-col items-center py-8 z-50">
        <div className="flex flex-col gap-6">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            const isNotifications = href === "/notifications";

            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={`group relative w-12 h-12 flex items-center justify-center rounded-full transition duration-300 ${
                      isActive
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-500 hover:bg-teal-500 hover:text-white"
                    }`}
                  >
                    <Icon className="text-xl" />
                    {isNotifications && notificationCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Subscription Status Indicator */}
        <div className="mt-auto mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              isSubscribed ? "bg-green-500" : "bg-gray-300"
            }`}
            title={isSubscribed ? "Subscribed to updates" : "Not subscribed"}
          />
        </div>
      </aside>
    </TooltipProvider>
  );
}
