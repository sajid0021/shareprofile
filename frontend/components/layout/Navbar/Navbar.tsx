"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Home, MessageCircle, Network, Search } from "lucide-react";

import { logoutUser } from "@/features/auth/services/authApi";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar/ProfileAvatar";

const navigationItems = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
  },
  {
    label: "My Network",
    href: "/network",
    icon: Network,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageCircle,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
];

export function Navbar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      router.replace("/login");
    } catch {
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#D9DDE1] bg-white">
      <div className="mx-auto flex h-14 max-w-[1128px] items-center gap-6 px-4">
        {/* Brand */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[#0A66C2]"
        >
          ProfileShare
        </Link>

        {/* Search */}
        <div className="hidden w-[280px] md:block">
          <div className="flex h-10 items-center gap-2 rounded-md bg-[#EEF3F8] px-3">
            <Search className="h-4 w-4 text-[#666666]" />

            <input
              type="search"
              placeholder="Search"
              className="w-full bg-transparent text-sm text-[#1D2226] outline-none placeholder:text-[#666666]"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="ml-auto flex items-center gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-[64px] flex-col items-center gap-0.5 text-[#666666] transition hover:text-[#1D2226]"
              >
                <Icon className="h-5 w-5" />
                <span className="hidden text-[11px] lg:block">
                  {item.label}
                </span>
              </Link>
            );
          })}
          <ProfileAvatar
            className="h-8 w-8 border border-[#D9DDE1] bg-[#D9DDE1]"
            textClassName="text-[10px] font-semibold text-[#666666]"
            allowUpload
          />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-xs font-semibold text-[#666666] hover:text-[#1D2226] disabled:opacity-50"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </nav>
      </div>
    </header>
  );
}