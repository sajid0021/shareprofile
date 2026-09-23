"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import type { ProfileFormValues } from "@/features/profile/schemas/profile.schema";
import { getPublicProfile } from "@/features/profile/services/profileApi";

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params
      .then(({ username }) => getPublicProfile(username))
      .then(setProfile)
      .catch(() => setError("This profile could not be found."));
  }, [params]);

  if (error) return <Card className="mx-auto mt-10 max-w-2xl p-6 text-sm text-[#CC1016]">{error}</Card>;
  if (!profile) return <Card className="mx-auto mt-10 max-w-2xl p-6 text-sm text-[#666666]">Loading profile...</Card>;

  return (
    <main className="mx-auto mt-10 max-w-2xl">
      <Card className="p-8">
        <h1 className="text-3xl font-semibold text-[#1D2226]">{profile.firstName} {profile.lastName}</h1>
        <p className="mt-2 text-lg text-[#0A66C2]">{profile.headline}</p>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-[#555555]">{profile.about}</p>
        <p className="mt-6 text-sm text-[#666666]">{profile.city}, {profile.state}, {profile.country}</p>
      </Card>
    </main>
  );
}
