"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase, mapAuthError } from "@/lib/supabase";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  university?: string;
  department?: string;
  year?: number;
  gpa?: number;
  isGuest?: boolean;
  emailConfirmed?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: false,
  initializing: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, needsConfirmation: false }),
  signInWithGoogle: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  continueAsGuest: () => {},
  signOut: async () => {},
  isAuthenticated: false,
});

function mapUser(supabaseUser: SupabaseUser): AppUser {
  const meta = supabaseUser.user_metadata ?? {};
  return {
    id: supabaseUser.id,
    name: meta.full_name || meta.name || supabaseUser.email?.split("@")[0] || "Student",
    email: supabaseUser.email ?? "",
    avatar: meta.avatar_url || meta.picture || undefined,
    university: meta.university || undefined,
    department: meta.department || undefined,
    year: meta.year_of_study ? Number(meta.year_of_study) : undefined,
    gpa: meta.gpa ? Number(meta.gpa) : undefined,
    // Only consider email confirmed if email_confirmed_at exists
    emailConfirmed: !!supabaseUser.email_confirmed_at,
    isGuest: false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  // initializing stays true until we've checked localStorage for an existing session
  const [initializing, setInitializing] = useState(true);
  // Track whether the first session check has resolved
  const sessionChecked = useRef(false);

  useEffect(() => {
    // STEP 1 — read whatever Supabase stored in localStorage synchronously
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      // Only accept a real Supabase session (not guest — guests are never persisted)
      if (s?.user) {
        setSession(s);
        setUser(mapUser(s.user));
      } else {
        // No stored session → user must log in
        setSession(null);
        setUser(null);
      }
      sessionChecked.current = true;
      setInitializing(false);
    });

    // STEP 2 — keep listening for future auth changes (login, logout, token refresh, OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      // Ignore the initial INITIAL_SESSION event if getSession hasn't resolved yet
      // to avoid a double-set race — we handle INITIAL_SESSION via getSession above.
      if (event === "INITIAL_SESSION") return;

      if (s?.user) {
        setSession(s);
        setUser(mapUser(s.user));
      } else {
        // SIGNED_OUT or token expired
        setSession(null);
        setUser(null);
      }

      // If we were still initializing and an event comes in, unblock
      if (!sessionChecked.current) {
        sessionChecked.current = true;
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign In — requires real Supabase credentials ───────────────────────────
  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { error: mapAuthError(error.message) };

      // Extra guard: block unconfirmed emails from accessing the app
      if (data.user && !data.user.email_confirmed_at) {
        // Sign them back out immediately
        await supabase.auth.signOut();
        return {
          error: "Please confirm your email before signing in. Check your inbox for the verification link.",
        };
      }

      return { error: null };
    } catch {
      return { error: "Something went wrong. Please try again." };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ error: string | null; needsConfirmation: boolean }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) return { error: mapAuthError(error.message), needsConfirmation: false };

      // Empty identities = this email is already registered
      if (data.user?.identities?.length === 0) {
        return { error: "An account with this email already exists. Sign in instead.", needsConfirmation: false };
      }

      // session is null = email confirmation required (Supabase project has confirm emails ON)
      // session exists  = auto-confirmed (confirm emails OFF in Supabase settings)
      const needsConfirmation = !data.session;

      // If auto-confirmed, the onAuthStateChange listener will pick up the session.
      // If confirmation required, sign them out to prevent auto-login with unconfirmed email.
      if (needsConfirmation) {
        await supabase.auth.signOut();
      }

      return { error: null, needsConfirmation };
    } catch {
      return { error: "Something went wrong. Please try again.", needsConfirmation: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async (): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) return { error: mapAuthError(error.message) };
      return { error: null };
      // Page will redirect to Google — no need to setLoading(false), the page navigates away
    } catch {
      setLoading(false);
      return { error: "Google sign-in failed. Please try again." };
    }
  }, []);

  // ── Password reset ─────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/auth/reset-password` },
      );
      if (error) return { error: mapAuthError(error.message) };
      return { error: null };
    } catch {
      return { error: "Failed to send reset email. Please try again." };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Guest — purely local, never touches Supabase ──────────────────────────
  const continueAsGuest = useCallback(() => {
    // Guest state lives only in memory — it is NOT persisted to localStorage.
    // Refreshing the page will require sign-in again, as expected.
    setUser({
      id: "guest",
      name: "Guest User",
      email: "guest@exitexam.et",
      isGuest: true,
    });
  }, []);

  // ── Sign Out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (user?.isGuest) {
      // Guest: just clear local state — nothing to sign out from Supabase
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    // onAuthStateChange will fire and clear user/session state
  }, [user]);

  // isAuthenticated is true for both real users AND guests.
  // Use user.isGuest inside components to restrict premium features.
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, session, loading, initializing,
      signIn, signUp, signInWithGoogle, resetPassword,
      continueAsGuest, signOut, isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
