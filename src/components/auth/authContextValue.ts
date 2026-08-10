import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  role: "student" | "admin";
  isAdmin: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  role: "student",
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);
