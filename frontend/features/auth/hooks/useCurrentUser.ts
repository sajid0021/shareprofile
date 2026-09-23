"use client";

import { useEffect, useState } from "react";

import { getCurrentUser, type AuthUser } from "../services/authApi";

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;

    getCurrentUser().then((currentUser) => {
      if (active) {
        setUser(currentUser);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return user;
}

export function getInitials(user: Pick<AuthUser, "firstName" | "lastName"> | null) {
  if (!user) return "?";
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}
