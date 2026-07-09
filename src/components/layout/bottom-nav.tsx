"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, Users, User } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/trips/new", icon: PlusCircle, label: "Plan" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const isPlan = item.href === "/trips/new";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200",
                isActive && !isPlan && "text-amazon-orange",
                !isActive && !isPlan && "text-gray-400 hover:text-gray-600"
              )}
            >
              {isPlan ? (
                <div className="w-12 h-12 -mt-4 bg-amazon-orange rounded-full flex items-center justify-center shadow-lg shadow-amazon-orange/30">
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
              ) : (
                <>
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
