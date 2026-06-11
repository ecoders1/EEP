"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  // Sign in
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  // Sign up
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  // OAuth
  signInWithGoogle: () => Promise<{ error: string | null }>;
  // Password reset
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  // Guest
  continueAsGuest: () => void;
  // Sign out
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────
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

// ─── Map Supabase user → AppUser ──────────────────────────────────────────────
function mapUser(supabaseUser: SupabaseUser): AppUser {
  const meta = supabaseUser.user_metadata ?? {};
  return {
    id: supabaseUser.id,
    name:
      meta.full_name ||
      meta.name ||
      supabaseUser.email?.split("@")[0] ||
      "Student",
    email: supabaseUser.email ?? "",
    avatar: meta.avatar_url || meta.picture || undefined,
    university: meta.university || undefined,
    department: meta.department || undefined,
    year: meta.year_of_study ? Number(meta.year_of_study) : undefined,
    gpa: meta.gpa ? Number(meta.gpa) : undefined,
    emailConfirmed: !!supabaseUser.email_confirmed_at,
    isGuest: false,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Restore session on mount + listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ? mapUser(s.user) : null);
      setInitializing(false);
    });

    // Listen to auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ? mapUser(s.user) : null);
      setInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign In ────────────────────────────────────────────────────────────────
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) return { error: mapAuthError(error.message) };
        return { error: null };
      } catch {
        return { error: "Something went wrong. Please try again." };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string
    ): Promise<{ error: string | null; needsConfirmation: boolean }> => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        });

        if (error) return { error: mapAuthError(error.message), needsConfirmation: false };

        // Supabase returns a user even if email confirmation is required
        // If identities is empty, the email already exists
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          return {
            error: "An account with this email already exists. Sign in instead.",
            needsConfirmation: false,
          };
        }

        // Check if confirmation email was sent (session is null when confirmation required)
        const needsConfirmation = !data.session;
        return { error: null, needsConfirmation };
      } catch {
        return { error: "Something went wrong. Please try again.", needsConfirmation: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
    } catch {
      return { error: "Google sign-in failed. Please try again." };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Password reset ─────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/auth/reset-password` }
      );
      if (error) return { error: mapAuthError(error.message) };
      return { error: null };
    } catch {
      return { error: "Failed to send reset email. Please try again." };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Guest ──────────────────────────────────────────────────────────────────
  const continueAsGuest = useCallback(() => {
    setUser({
      id: "guest",
      name: "Guest User",
      email: "guest@exitexam.et",
      isGuest: true,
    });
  }, []);

  // ── Sign Out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    // If guest, just clear local state
    if (user?.isGuest) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        initializing,
        signIn,
        signUp,
        signInWithGoogle,
        resetPassword,
        continueAsGuest,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
