"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hard sign-out page — visit /auth/signout to clear all sessions.
 * Useful when a stale session auto-logs you in during testing.
 */
export default function SignOutPage() {
  useEffect(() => {
    supabase.auth.signOut().then(() => {
      // Clear everything from localStorage
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-")) localStorage.removeItem(key);
        });
        window.location.href = "/";
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-white text-2xl shadow-2xl animate-pulse">
          🚪
        </div>
        <p className="text-white/60 text-sm">Signing out…</p>
        <p className="text-white/30 text-xs">Redirecting to login page</p>
      </div>
    </div>
  );
}
