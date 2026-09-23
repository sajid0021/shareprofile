import type { ProfileFormValues } from "../schemas/profile.schema";

const PROFILE_STORAGE_KEY = "profileshare_profile";

export function saveProfile(profile: ProfileFormValues): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function getSavedProfile(): ProfileFormValues | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!storedProfile) {
    return null;
  }

  try {
    return JSON.parse(storedProfile) as ProfileFormValues;
  } catch {
    return null;
  }
}

export function clearSavedProfile(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
}
