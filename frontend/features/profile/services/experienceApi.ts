import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

import type { Experience } from "../types/profile.types";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export async function getMyExperiences(): Promise<Experience[]> {
  try {
    const response = await api.get("/experience");
    return response.data.data ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load experiences."));
  }
}

export async function createExperience(
  experience: Omit<Experience, "id">,
): Promise<Experience> {
  try {
    const response = await api.post("/experience", experience);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to save experience."));
  }
}

export async function getExperienceById(experienceId: string): Promise<Experience> {
  try {
    const response = await api.get(`/experience/${experienceId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load experience."));
  }
}

export async function updateExperience(
  experienceId: string,
  experience: Omit<Experience, "id">,
): Promise<Experience> {
  try {
    const response = await api.put(`/experience/${experienceId}`, experience);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update experience."));
  }
}

export async function deleteExperience(experienceId: string): Promise<void> {
  try {
    await api.delete(`/experience/${experienceId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete experience."));
  }
}
