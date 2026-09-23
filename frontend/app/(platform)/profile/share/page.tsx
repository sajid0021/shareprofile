"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getMyProfile } from "@/features/profile/services/profileApi";
import { getCurrentUser } from "@/features/auth/services/authApi";

export default function ShareProfilePage() {
  const [message, setMessage] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    Promise.all([getMyProfile(), getCurrentUser()])
      .then(([profile, user]) => {
        const nextUsername = profile?.username || `${user?.firstName || "profile"}-${user?.id.slice(-6)}`;
        if (nextUsername) {
          setProfileUrl(`${window.location.origin}/public/${encodeURIComponent(nextUsername)}`);
        }
      })
      .catch(() => setMessage("Unable to load your profile link. Please try again."));
  }, []);

  const copyLink = async () => {
    if (!profileUrl) return;
    await navigator.clipboard.writeText(profileUrl);
    setMessage("Profile link copied.");
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-semibold text-[#1D2226]">Share your profile</h1>
      <p className="mt-2 text-sm text-[#666666]">Send your public profile link to your network.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input readOnly value={profileUrl} className="min-w-0 flex-1 rounded-md border border-[#D9DDE1] px-3 py-2 text-sm" />
        <Button type="button" onClick={copyLink} disabled={!profileUrl}>Copy link</Button>
        <a
          href={profileUrl ? `mailto:?subject=My Profile&body=${encodeURIComponent(profileUrl)}` : undefined}
          className="inline-flex items-center justify-center rounded-full border border-[#0A66C2] px-5 py-2 text-sm font-semibold text-[#0A66C2]"
        >
          Email link
        </a>
      </div>
      {message ? <p className="mt-4 text-sm text-[#666666]">{message}</p> : null}
    </Card>
  );
}
