"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ProfileFormValues } from "@/features/profile/schemas/profile.schema";
import { getMyProfile } from "@/features/profile/services/profileApi";

export default function ResumePage() {
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => setError("Save your profile before generating a resume."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Card className="p-6 text-sm text-[#666666]">Preparing your resume...</Card>;
  if (error || !profile) {
    return (
      <Card className="p-6">
        <p className="text-sm text-[#CC1016]">{error || "No profile data is available."}</p>
        <a className="mt-4 inline-flex text-sm font-semibold text-[#0A66C2]" href="/profile/edit">
          Complete your profile
        </a>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#1D2226]">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="mt-1 text-lg text-[#0A66C2]">{profile.headline}</p>
          <p className="mt-2 text-sm text-[#666666]">
            {profile.city}, {profile.state}, {profile.country} · {profile.email}
          </p>
        </div>
        <Button type="button" onClick={() => window.print()}>
          Download / Print PDF
        </Button>
      </div>

      <section className="border-t border-[#D9DDE1] pt-6">
        <h2 className="text-lg font-semibold text-[#1D2226]">Professional Summary</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#555555]">{profile.about}</p>
      </section>
    </Card>
  );
}
