"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { SkillsForm } from "@/features/profile/components/SkillsForm";
import { getMyProfile, saveMySkills } from "@/features/profile/services/profileApi";

export default function SkillsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

  const initialSkills = query.data?.skills ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      {query.isError ? (
        <p className="mb-4 text-sm text-[#CC1016]">
          {query.error instanceof Error ? query.error.message : "Unable to load your skills."}
        </p>
      ) : null}

      <SkillsForm
        key={initialSkills.join("\u0000")}
        initialSkills={initialSkills}
        onSave={async (skills) => {
          await saveMySkills(skills);
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          router.push("/profile");
        }}
      />
    </div>
  );
}
