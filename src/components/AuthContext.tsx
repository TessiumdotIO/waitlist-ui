"use client";

import { createContext, useContext } from "react";
import { User as AppUser } from "./types"; // Adjust path as needed

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  // allow setState-style updater (functional updates) for convenience
  setUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  // default no-op until provider overrides
  // cast to satisfy the dispatch signature
  setUser: (() => {}) as React.Dispatch<React.SetStateAction<AppUser | null>>,
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);
