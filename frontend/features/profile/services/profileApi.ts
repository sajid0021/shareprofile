import axios from "axios";

import type { ProfileFormValues } from "../schemas/profile.schema";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export async function getMyProfile(): Promise<ProfileFormValues | null> {
  try {
    const response = await api.get("/profiles/me");
    return response.data.profile ?? null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load profile."));
  }
}

export async function saveMyProfile(profile: ProfileFormValues): Promise<ProfileFormValues> {
  try {
    const response = await api.put("/profiles/me", profile);
    return response.data.profile;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to save profile."));
  }
}

export async function saveMyProfileImage(profileImage: string): Promise<ProfileFormValues> {
  try {
    const response = await api.put("/profiles/me/image", { profileImage });
    return response.data.profile;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to save profile image."));
  }
}

export async function saveMySkills(skills: string[]): Promise<ProfileFormValues> {
  try {
    const response = await api.put("/profiles/me/skills", { skills });
    return response.data.profile;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to save skills."));
  }
}

export async function getPublicProfile(username: string): Promise<ProfileFormValues> {
  const response = await api.get(`/profiles/public/${encodeURIComponent(username)}`);
  return response.data.profile;
}
