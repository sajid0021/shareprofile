"use client";

import { useCallback, useState } from "react";

import {
  type AuthSession,
  getAuthSession,
  setAuthSession,
  signOut,
} from "../services/authSession";

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());

  const refresh = useCallback(() => {
    setSession(getAuthSession());
  }, []);

  const login = useCallback((nextSession: AuthSession) => {
    setAuthSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    signOut();
    setSession(null);
  }, []);

  return {
    session,
    isAuthenticated: Boolean(session),
    isReady: true,
    login,
    logout,
    refresh,
  };
}
