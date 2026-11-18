import { createContext, useContext } from "react";
import type {
  UniversityFeatureKey,
  UniversityWithSettings,
} from "../../types/university";

export type UniversityContextValue = {
  university: UniversityWithSettings | null;
  loading: boolean;
  error: string | null;
  path: (pathname?: string) => string;
  isFeatureEnabled: (feature: UniversityFeatureKey) => boolean;
};

export const UniversityContext = createContext<UniversityContextValue | null>(null);

export function useUniversity() {
  const value = useContext(UniversityContext);
  if (!value) throw new Error("useUniversity must be used inside UniversityProvider");
  return value;
}

export const useOptionalUniversity = () => useContext(UniversityContext);
