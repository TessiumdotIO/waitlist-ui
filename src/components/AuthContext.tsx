// components/AuthContext.tsx
"use client";

import { createContext, useContext } from "react";
import type { User } from "./types";

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export const useAuth = () => useContext(AuthContext);
