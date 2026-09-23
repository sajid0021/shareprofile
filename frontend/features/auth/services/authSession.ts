export type AuthSession = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

// Auth is owned by the backend cookie; these helpers remain only for legacy hook compatibility.
export function getAuthSession(): AuthSession | null {
  return null;
}

export function setAuthSession(session: AuthSession): void {
  // The backend session cookie is intentionally not duplicated in browser storage.
  void session;
}

export async function signInDemo() {
  return null;
}

export async function signOut() {
  return null;
}
