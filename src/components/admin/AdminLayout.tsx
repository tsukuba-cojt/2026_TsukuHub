import { NavLink } from "react-router-dom";
import { BriefcaseBusiness, ClipboardList, LayoutDashboard } from "lucide-react";
import Globalnav from "../utility/Globalnav";
import Footer from "../utility/Footer";
import "../../styles/career/CareerPlatform.css";

export default function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) { return <div className="careerPlatform adminPlatform"><Globalnav /><div className="adminShell"><aside className="adminSidebar"><p>TSUKUHUB ADMIN</p><nav><NavLink end to="/admin"><LayoutDashboard />ダッシュボード</NavLink><NavLink to="/admin/internships"><BriefcaseBusiness />求人管理</NavLink><NavLink to="/admin/applications"><ClipboardList />応募者管理</NavLink></nav></aside><main className="adminContent"><header className="adminHeader"><span>管理者画面</span><h1>{title}</h1></header>{children}</main></div><Footer /></div>; }
