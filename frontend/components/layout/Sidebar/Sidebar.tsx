"use client";

import Link from "next/link";
import { UserRound, Briefcase, FileText, Share2 } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar/ProfileAvatar";

const items = [
  {
    label: "My Profile",
    href: "/profile",
    icon: UserRound,
  },
  {
    label: "Experience",
    href: "/profile#experience",
    icon: Briefcase,
  },
  {
    label: "Resume",
    href: "/resume",
    icon: FileText,
  },
  {
    label: "Share Profile",
    href: "/profile/share",
    icon: Share2,
  },
];

export function Sidebar() {
  const user = useCurrentUser();

  return (
    <aside className="hidden lg:block">
      <div className="overflow-hidden rounded-lg border border-[#D9DDE1] bg-white">
        <div className="h-16 bg-[#0A66C2]" />

        <div className="px-4 pb-5">
          <div className="-mt-8 flex justify-center">
            <ProfileAvatar
              className="h-16 w-16 border-4 border-white bg-[#D9DDE1]"
              textClassName="text-lg font-semibold text-[#666666]"
              allowUpload
            />
          </div>

          <div className="mt-3 text-center">
            <h2 className="font-semibold text-[#1D2226]">
              {user ? `${user.firstName} ${user.lastName}` : "Your Profile"}
            </h2>

            <p className="mt-1 text-xs text-[#666666]">Professional profile</p>
          </div>

          <div className="my-4 border-t border-[#D9DDE1]" />

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[#666666] transition hover:bg-[#F3F2EF] hover:text-[#1D2226]"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
