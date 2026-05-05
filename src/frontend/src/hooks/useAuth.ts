import { useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "smart-ai-task-manager.auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: "email" | "google";
}

function createUser(email: string, provider: AuthUser["provider"]): AuthUser {
  const cleanEmail = email.trim().toLowerCase();
  const name = cleanEmail.split("@")[0]?.replace(/[._-]+/g, " ") || "User";

  return {
    id: `${provider}:${cleanEmail}`,
    name: name.replace(/\b\w/g, (char) => char.toUpperCase()),
    email: cleanEmail,
    provider,
  };
}

function readStoredUser(): AuthUser | null {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setIsLoading(false);
  }, []);

  const saveUser = (nextUser: AuthUser) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const loginWithEmail = (email: string) => {
    saveUser(createUser(email, "email"));
  };

  const signupWithEmail = (email: string) => {
    saveUser(createUser(email, "email"));
  };

  const loginWithGoogle = () => {
    saveUser(createUser("google.user@gmail.com", "google"));
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  return {
    isAuthenticated: user !== null,
    isLoading,
    principal: user?.email ?? null,
    user,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
  };
}
