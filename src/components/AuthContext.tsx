import { createContext, useContext } from "react";
import { User } from "./types";

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  authReady: boolean;
  refresh: () => Promise<void>;
  isTwitterConnected: boolean;
}

// ✅ Only create context here, once
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
