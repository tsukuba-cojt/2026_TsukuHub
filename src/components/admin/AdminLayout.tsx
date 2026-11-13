import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  BellRing,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { clearActiveUniversitySlug } from "../../lib/tenantSession";
import "../../styles/career/CareerPlatform.css";
import "../../styles/university/UniversityPortal.css";

export default function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  const logout = async () => {
    await supabase.auth.signOut();
    clearActiveUniversitySlug();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="careerPlatform adminPlatform">
      <header className="portalHeader adminTopbar"><Link className="portalBrand" to="/admin">TsukuHub Admin</Link><div><Link to="/">大学選択を表示</Link><button type="button" onClick={() => void logout()}><LogOut aria-hidden="true" />ログアウト</button></div></header>
      <div className="adminShell">
        <aside className="adminSidebar">
          <p>TSUKUHUB ADMIN</p>
          <nav>
            <NavLink end to="/admin"><LayoutDashboard />ダッシュボード</NavLink>
            <NavLink to="/admin/universities"><Building2 />大学管理</NavLink>
            <NavLink to="/admin/news"><BellRing />ニュース管理</NavLink>
            <NavLink to="/admin/internships"><BriefcaseBusiness />求人管理</NavLink>
            <NavLink to="/admin/applications"><ClipboardList />応募者管理</NavLink>
            <NavLink to="/admin/career-content"><GraduationCap />就活コンテンツ</NavLink>
            <NavLink to="/admin/class-management"><BookOpenCheck />履修・通報管理</NavLink>
          </nav>
        </aside>
        <main className="adminContent"><header className="adminHeader"><span>管理者画面</span><h1>{title}</h1></header>{children}</main>
      </div>
    </div>
  );
}
