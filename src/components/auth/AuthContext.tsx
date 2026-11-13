import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"student" | "global_admin">("student");
  const [universityId, setUniversityId] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = async (nextUser: User | null) => {
      setUser(nextUser);
      if (!nextUser) {
        setRole("student");
        setUniversityId(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role, university_id")
        .eq("id", nextUser.id)
        .maybeSingle();
      setRole(data?.role === "global_admin" ? "global_admin" : "student");
      setUniversityId(data?.university_id ?? null);
      setLoading(false);
    };

    void supabase.auth.getSession().then(({ data: { session } }) => syncUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        isAdmin: role === "global_admin",
        universityId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
