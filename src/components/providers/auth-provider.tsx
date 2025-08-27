"use client";

import React, { createContext, useContext } from "react";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

const AuthContext = createContext(authClient);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={authClient}>{children}</AuthContext.Provider>
  );
}

export function useAuthClient() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthClient must be used within an AuthProvider");
  }
  return context;
}

export { authClient };
