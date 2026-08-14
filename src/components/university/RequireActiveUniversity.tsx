import { Navigate, Outlet } from "react-router-dom";
import { useUniversity } from "./universityContextValue";

export default function RequireActiveUniversity() {
  const { university, loading, path } = useUniversity();

  if (loading) return <main className="careerState">読み込んでいます...</main>;
  if (!university) return <Navigate to="/404" replace />;
  if (university.status === "suspended") return <Navigate to={path()} replace />;
  return <Outlet />;
}
