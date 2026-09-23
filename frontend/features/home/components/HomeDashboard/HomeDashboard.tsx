"use client";

import { ArrowRight, BriefcaseBusiness, FileText, Share2, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar/ProfileAvatar";

const quickActions = [
  {
    title: "Complete your profile",
    description: "Add your experience, education, skills and projects.",
    icon: BriefcaseBusiness,
    href: "/profile",
  },
  {
    title: "Build your resume",
    description: "Create a professional resume from your profile.",
    icon: FileText,
    href: "/resume",
  },
  {
    title: "Share your profile",
    description: "Generate a public profile link to share with others.",
    icon: Share2,
    href: "/profile/share",
  },
];

export function HomeDashboard() {
  const user = useCurrentUser();

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-[#0A66C2]" />

        <div className="px-6 pb-6">
          <div className="-mt-8">
            <ProfileAvatar
              className="h-16 w-16 border-4 border-white bg-[#D9DDE1]"
              textClassName="text-lg font-semibold text-[#666666]"
              allowUpload
            />
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-[#0A66C2]">
              Welcome back{user ? `, ${user.firstName}` : ""}
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-[#1D2226]">
              Build your professional presence
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666666]">
              Keep your profile updated, build your resume, and share your professional identity
              with your network.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/profile/edit"><Button>Complete Profile</Button></Link>

            <Link href="/profile/share"><Button variant="secondary">View Public Profile</Button></Link>
          </div>
        </div>
      </Card>

      {/* Profile completion */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1D2226]">Profile completion</h2>

            <p className="mt-1 text-sm text-[#666666]">
              Complete your profile to make it ready to share.
            </p>
          </div>

          <span className="text-sm font-semibold text-[#0A66C2]">35%</span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E8EBED]">
          <div className="h-full w-[35%] rounded-full bg-[#0A66C2]" />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[#666666]">
          <span>3 of 8 sections completed</span>

          <Link href="/profile/edit" className="font-semibold text-[#0A66C2] hover:underline">Complete now</Link>
        </div>
      </Card>

      {/* Quick actions */}
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-[#1D2226]">Quick actions</h2>

          <p className="mt-1 text-sm text-[#666666]">
            Continue building your professional profile.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Card key={action.title} className="p-5 transition-shadow hover:shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F3FF]">
                  <Icon className="h-5 w-5 text-[#0A66C2]" />
                </div>

                <h3 className="mt-4 font-semibold text-[#1D2226]">{action.title}</h3>

                <p className="mt-2 text-sm leading-5 text-[#666666]">{action.description}</p>

                <Link
                  href={action.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0A66C2] hover:underline"
                >
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Network snapshot */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F3FF]">
            <Users className="h-5 w-5 text-[#0A66C2]" />
          </div>

          <div>
            <h2 className="font-semibold text-[#1D2226]">Your network</h2>

            <p className="text-sm text-[#666666]">Start building your professional connections.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-md bg-[#F8F9FA] p-4">
            <p className="text-2xl font-semibold text-[#1D2226]">0</p>

            <p className="mt-1 text-xs text-[#666666]">Connections</p>
          </div>

          <div className="rounded-md bg-[#F8F9FA] p-4">
            <p className="text-2xl font-semibold text-[#1D2226]">0</p>

            <p className="mt-1 text-xs text-[#666666]">Invitations</p>
          </div>

          <div className="rounded-md bg-[#F8F9FA] p-4">
            <p className="text-2xl font-semibold text-[#1D2226]">0</p>

            <p className="mt-1 text-xs text-[#666666]">Profile views</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
