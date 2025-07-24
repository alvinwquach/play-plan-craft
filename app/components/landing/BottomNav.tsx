"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaClipboardList, FaCalendarAlt } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: FaHome },
    { href: "/lesson-plan", label: "Plan", icon: FaClipboardList },
    { href: "/calendar", label: "Calendar", icon: FaCalendarAlt },
  ];

  return (
    <TooltipProvider>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-md flex justify-around items-center h-16 z-50">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={`flex flex-col items-center text-xs font-medium ${
                    isActive ? "text-teal-600" : "text-gray-500"
                  }`}
                >
                  <Icon
                    className={`text-xl mb-1 ${
                      isActive ? "text-teal-600" : ""
                    }`}
                  />
                  {label}
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
