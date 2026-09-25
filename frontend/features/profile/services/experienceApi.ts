import axios from "axios";

import type { Experience } from "../types/profile.types";

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
