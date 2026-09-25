"use client";

import { SkillsForm } from "@/features/profile/components/SkillsForm";
import { getMyProfile, saveMySkills } from "@/features/profile/services/profileApi";
import { useEffect, useState } from "react";

export default function SkillsPage() {
  const [initialSkills, setInitialSkills] = useState<string[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        setInitialSkills(profile?.skills ?? []);
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Unable to load your skills.");
        setInitialSkills([]);
      });
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      {loadError ? <p className="mb-4 text-sm text-[#CC1016]">{loadError}</p> : null}

      <SkillsForm
        key={initialSkills.join("\u0000")}
        initialSkills={initialSkills}
        onSave={async (skills) => {
          await saveMySkills(skills);
          setInitialSkills(skills);
        }}
      />
    </div>
  );
}
