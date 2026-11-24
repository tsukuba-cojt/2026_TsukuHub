import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContextValue";
import { setActiveUniversitySlug } from "../../lib/tenantSession";
import { getUniversityBySlug } from "../../services/universityService";
import type {
  UniversityFeatureKey,
  UniversityWithSettings,
} from "../../types/university";
import { UniversityContext } from "./universityContextValue";

export default function UniversityProvider({ children }: { children: React.ReactNode }) {
  const { universitySlug = "" } = useParams();
  const { isAdmin } = useAuth();
  const [result, setResult] = useState<{
    slug: string;
    university: UniversityWithSettings | null;
    error: string | null;
  }>({ slug: "", university: null, error: null });

  const loading = result.slug !== universitySlug;
  const university = loading ? null : result.university;
  const error = loading ? null : result.error;

  useEffect(() => {
    let cancelled = false;
    void getUniversityBySlug(universitySlug)
      .then((item) => {
        if (!cancelled) setResult({ slug: universitySlug, university: item, error: null });
      })
      .catch(() => {
        if (!cancelled) setResult({ slug: universitySlug, university: null, error: "大学情報を取得できませんでした。" });
      });
    return () => {
      cancelled = true;
    };
  }, [universitySlug]);

  useEffect(() => {
    if (isAdmin && university) setActiveUniversitySlug(university.slug);
  }, [isAdmin, university]);

  const path = useCallback(
    (pathname = "") => {
      const suffix = pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;
      return `/${universitySlug}${suffix}`;
    },
    [universitySlug],
  );

  const value = useMemo(
    () => ({
      university,
      loading,
      error,
      path,
      isFeatureEnabled: (feature: UniversityFeatureKey) =>
        Boolean(isAdmin || university?.features[feature] === "enabled"),
    }),
    [error, isAdmin, loading, path, university],
  );

  return <UniversityContext.Provider value={value}>{children}</UniversityContext.Provider>;
}
