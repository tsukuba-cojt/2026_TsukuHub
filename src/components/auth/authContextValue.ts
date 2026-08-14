import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  role: "student" | "global_admin";
  isAdmin: boolean;
  universityId: string | null;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  role: "student",
  isAdmin: false,
  universityId: null,
});

export const useAuth = () => useContext(AuthContext);
