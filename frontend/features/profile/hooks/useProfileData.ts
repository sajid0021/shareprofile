"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyExperiences } from "../services/experienceApi";
import { getMyProfile } from "../services/profileApi";

export function useProfileData() {
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

  const experiencesQuery = useQuery({
    queryKey: ["experiences"],
    queryFn: getMyExperiences,
  });

  return {
    profile: profileQuery.data ?? null,
    experiences: experiencesQuery.data ?? [],
    isLoading: profileQuery.isLoading || experiencesQuery.isLoading,
    error: profileQuery.error ?? experiencesQuery.error,
  };
}
