"use client";

import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/components/auth/LoginPage";
import DashboardPage from "@/components/dashboard/DashboardPage";

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  return <LoginPage />;
}
