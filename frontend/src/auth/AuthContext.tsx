/**
 * Auth context (A1-2). Real authentication is EP-04, OWNED BY THE CYBERSECURITY
 * pathway. This provider talks to the auth RESOURCE MODULE (src/api/auth.ts),
 * which — in dev — is backed by the SCOPED MOCK (src/mocks/server.ts). That lets
 * the login → session → role-gating flow run end-to-end now; when Cybersecurity
 * ships the real endpoints, only the resource module's `useMocks` branch changes.
 *
 * Token-vs-cookie persistence is still the open EP-04 decision (contracts §EP-04);
 * the mock keeps the session in memory, so a hard refresh logs out for now.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser, Role } from '../api/types';
import { registerUnauthorizedHandler } from '../api/client';
import * as authApi from '../api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Whether the initial "who am I?" check has resolved (prevents content flash). */
  isLoading: boolean;
  /** Set while a login request is in flight (drives the form's pending state). */
  isLoggingIn: boolean;
  hasRole: (role: Role) => boolean;
  /** Throws on failure so the login form can show the error. */
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Resolve any existing session on mount (mock starts logged-out).
  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((resolved) => {
        if (!cancelled) setUser(resolved);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // A 401 from any API call logs the user out (A8-1 seam).
  useEffect(() => {
    registerUnauthorizedHandler(() => setUser(null));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      isLoggingIn,
      hasRole: (role: Role) => user?.roles.includes(role) ?? false,
      login: async (email: string, password: string) => {
        setIsLoggingIn(true);
        try {
          const { user: loggedIn } = await authApi.login(email, password);
          setUser(loggedIn);
        } finally {
          setIsLoggingIn(false);
        }
      },
      logout: () => {
        void authApi.logout();
        setUser(null);
      },
    }),
    [user, isLoading, isLoggingIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>.');
  return ctx;
}
