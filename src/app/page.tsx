"use client";

import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/components/auth/LoginPage";
import AppShell from "@/components/layout/AppShell";

export default function Home() {
  const { isAuthenticated, initializing } = useAuth();

  // While Supabase is restoring the session, show a minimal loading screen
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="flex flex-col items-center gap-4">
          {/* Logo mark */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-2xl shadow-violet-500/30 animate-pulse">
            EE
          </div>
          {/* Spinner */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-white/30 text-xs">Exit Exam Ethiopia</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AppShell />;
  }

  return <LoginPage />;
}
