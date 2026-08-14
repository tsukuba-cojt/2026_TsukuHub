import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./authContextValue";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <main className="careerState"><p>権限を確認しています...</p></main>;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <main className="careerState"><h1>アクセスできません</h1><p>この画面は管理者専用です。</p></main>;
  return children;
}
