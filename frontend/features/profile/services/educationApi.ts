import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

import type { Education } from "../types/profile.types";

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

export async function getMyEducation(): Promise<Education[]> {
  try {
    const response = await api.get("/education");
    return response.data.data ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load education."));
  }
}

export async function createEducation(
  education: Omit<Education, "id">,
): Promise<Education> {
  try {
    const response = await api.post("/education", education);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to save education."));
  }
}

export async function getEducationById(educationId: string): Promise<Education> {
  try {
    const response = await api.get(`/education/${educationId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load education."));
  }
}

export async function updateEducation(
  educationId: string,
  education: Omit<Education, "id">,
): Promise<Education> {
  try {
    const response = await api.put(`/education/${educationId}`, education);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update education."));
  }
}

export async function deleteEducation(educationId: string): Promise<void> {
  try {
    await api.delete(`/education/${educationId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete education."));
  }
}
