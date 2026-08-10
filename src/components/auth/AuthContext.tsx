import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"student" | "admin">("student");

  useEffect(() => {
    const syncUser = async (nextUser: User | null) => {
      setUser(nextUser);
      if (!nextUser) {
        setRole("student");
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", nextUser.id)
        .maybeSingle();
      setRole(data?.role === "admin" ? "admin" : "student");
      setLoading(false);
    };

    void supabase.auth.getSession().then(({ data: { session } }) => syncUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, isAdmin: role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}
