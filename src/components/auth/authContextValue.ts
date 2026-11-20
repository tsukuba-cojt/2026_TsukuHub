import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import { DEFAULT_AVATAR_COLOR, type AvatarColor } from "../../lib/userProfile";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  role: "student" | "global_admin";
  isAdmin: boolean;
  universityId: string | null;
  avatarColor: AvatarColor;
  setAvatarColor: (color: AvatarColor) => void;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  role: "student",
  isAdmin: false,
  universityId: null,
  avatarColor: DEFAULT_AVATAR_COLOR,
  setAvatarColor: () => {},
});

export const useAuth = () => useContext(AuthContext);
