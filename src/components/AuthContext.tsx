"use client";

import { createContext, useContext } from "react";
import { User as AppUser } from "./types"; // Adjust path as needed

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);
