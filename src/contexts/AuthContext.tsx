"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  university?: string;
  department?: string;
  year?: number;
  gpa?: number;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithTelegram: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  loginWithTelegram: async () => {},
  loginAsGuest: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, _password: string) => {
    setLoading(true);
    // Simulate authentication delay
    await new Promise((r) => setTimeout(r, 1200));
    setUser({
      id: "usr_001",
      name: "Abebe Kebede",
      email,
      university: "Addis Ababa University",
      department: "Computer Science",
      year: 4,
      gpa: 3.75,
    });
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setUser({
      id: "usr_002",
      name: "Tigist Alemu",
      email: "tigist@gmail.com",
      university: "Addis Ababa University",
      department: "Electrical Engineering",
      year: 3,
      gpa: 3.85,
    });
    setLoading(false);
  };

  const loginWithTelegram = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setUser({
      id: "usr_003",
      name: "Dawit Haile",
      email: "dawit@telegram.auth",
      university: "Jimma University",
      department: "Medicine",
      year: 5,
      gpa: 3.60,
    });
    setLoading(false);
  };

  const loginAsGuest = () => {
    setUser({
      id: "guest",
      name: "Guest User",
      email: "guest@exitexam.et",
      isGuest: true,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        loginWithTelegram,
        loginAsGuest,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
