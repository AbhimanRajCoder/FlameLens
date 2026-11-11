import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as auth from './auth';
import type { AuthSession } from './auth';

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: AuthSession | null;
  isGuest: boolean;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthSession | null>;
  signUp: (email: string, password: string) => Promise<{ session: AuthSession | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isGuest, setIsGuest] = useState(() => {
    try { return window.sessionStorage.getItem('flamelens:guest-profile') === 'active'; } catch { return false; }
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await auth.getValidSession();
    setSession(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    auth.getValidSession().then((next) => {
      if (!mounted) return;
      setSession(next);
      setLoading(false);
    });
    const unsubscribe = auth.onAuthStateChange((next) => {
      if (!mounted) return;
      setSession(next);
      setLoading(false);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: auth.authConfigured,
      loading,
      session,
      isGuest,
      refresh,
      signIn: async (email, password) => {
        const next = await auth.signInWithPassword(email, password);
        setSession(next);
        return next;
      },
      signUp: async (email, password) => {
        const result = await auth.signUpWithPassword(email, password);
        setSession(result.session);
        return result;
      },
      signOut: async () => {
        await auth.signOut();
        setSession(null);
        setIsGuest(false);
        try { window.sessionStorage.removeItem('flamelens:guest-profile'); } catch { /* storage may be unavailable */ }
      },
      continueAsGuest: async () => {
        await auth.signOut();
        setSession(null);
        setIsGuest(true);
        try { window.sessionStorage.setItem('flamelens:guest-profile', 'active'); } catch { /* the current tab can still use the guest profile */ }
      },
      requestPasswordReset: auth.requestPasswordReset,
    }),
    [isGuest, loading, refresh, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
