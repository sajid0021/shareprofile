import axios from "axios";

import type { Project } from "../types/profile.types";

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

export async function getMyProjects(): Promise<Project[]> {
  try {
    const response = await api.get("/projects");
    return response.data.data ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load projects."));
  }
}

export async function getProjectById(projectId: string): Promise<Project> {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load project."));
  }
}

export async function createProject(project: Omit<Project, "id">): Promise<Project> {
  try {
    const response = await api.post("/projects", project);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to save project."));
  }
}

export async function updateProject(projectId: string, project: Omit<Project, "id">): Promise<Project> {
  try {
    const response = await api.put(`/projects/${projectId}`, project);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update project."));
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    await api.delete(`/projects/${projectId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete project."));
  }
}
