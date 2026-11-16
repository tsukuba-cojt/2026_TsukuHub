import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContextValue";
import { supabase } from "../../lib/supabase";
import "../../styles/career/CareerPlatform.css";
import "../../styles/company/CompanyPortal.css";

export default function CompanyLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return <main className="careerState">読み込んでいます...</main>;
  if (!user) return <Navigate to="/company/login" replace />;
  return <div className="careerPlatform companyPortal">
    <header className="companyTopbar"><Link to="/company" className="companyBrand">TsukuHub <span>採用管理</span></Link><button type="button" onClick={async () => { await supabase.auth.signOut(); navigate("/company/login", { replace: true }); }}>ログアウト</button></header>
    <main className="companyContent"><header className="companyHeading"><p>企業向けページ</p><h1>{title}</h1><span>{user.email}</span></header>{children}</main>
  </div>;
}
