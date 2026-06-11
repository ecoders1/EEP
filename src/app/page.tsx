"use client";

import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/components/auth/LoginPage";
import AppShell from "@/components/layout/AppShell";

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <AppShell />;
  }

  return <LoginPage />;
}
