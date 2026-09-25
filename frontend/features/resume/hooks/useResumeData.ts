"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "@/features/auth/services/authApi";
import { getMyEducation } from "@/features/profile/services/educationApi";
import { getMyExperiences } from "@/features/profile/services/experienceApi";
import { getMyProfile } from "@/features/profile/services/profileApi";
import { getMyProjects } from "@/features/profile/services/projectApi";

export function useResumeData() {
  const userQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });
  const isAuthenticated = Boolean(userQuery.data);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
  });
  const experiencesQuery = useQuery({
    queryKey: ["experiences"],
    queryFn: getMyExperiences,
    enabled: isAuthenticated,
  });
  const educationQuery = useQuery({
    queryKey: ["education"],
    queryFn: getMyEducation,
    enabled: isAuthenticated,
  });
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getMyProjects,
    enabled: isAuthenticated,
  });

  return {
    user: userQuery.data ?? null,
    profile: profileQuery.data ?? null,
    experiences: experiencesQuery.data ?? [],
    education: educationQuery.data ?? [],
    projects: projectsQuery.data ?? [],
    isLoading:
      userQuery.isLoading ||
      (isAuthenticated &&
        (profileQuery.isLoading ||
          experiencesQuery.isLoading ||
          educationQuery.isLoading ||
          projectsQuery.isLoading)),
    error:
      userQuery.error ?? profileQuery.error ?? experiencesQuery.error ?? educationQuery.error ?? projectsQuery.error,
  };
}
