import axios from "axios";

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

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  provider: "email" | "google";
};

export async function registerUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  try {
    const response = await api.post("/auth/register", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create account."));
  }
}

export async function loginUser(payload: { email: string; password: string }) {
  try {
    const response = await api.post("/auth/login", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to sign in."));
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await api.get("/auth/me");

    return response.data.user ?? null;
  } catch {
    return null;
  }
}

export async function logoutUser() {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw error;
    }
  }
}
