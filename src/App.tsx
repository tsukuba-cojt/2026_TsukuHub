import { legacyRoots } from "./lib/legacyRoutes";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useMatch } from "react-router-dom";
import { defaultUniversityPath } from "./lib/tenantNavigation";
import LandingLoading from "./components/university/LandingLoading";
import { useUniversity } from "./components/university/universityContextValue";
import { useAuth } from "./components/auth/authContextValue";
import { SeoNavigation } from "./seo/PageSeo";
import Header from "./components/utility/Header";
import InternalLinkGuard from "./components/utility/InternalLinkGuard";
import ScrollToTop from "./components/utility/ScrollToTop";
import { AuthProvider } from "./components/auth/AuthContext";
import RequireAdmin from "./components/auth/RequireAdmin";
import RequireUniversityAccess from "./components/auth/RequireUniversityAccess";
import Confirm from "./components/auth/Confirm";
import FeatureGate from "./components/university/FeatureGate";
import UniversityProvider from "./components/university/UniversityProvider";
import RequireActiveUniversity from "./components/university/RequireActiveUniversity";
import UniversityLanding from "./pages/UniversityLanding";
import Login from "./pages/Login";
import { RequestPasswordReset, ResetPassword } from "./pages/PasswordRecovery";
import Signup from "./pages/Signup";
import Class from "./pages/Class";
import ClassTop from "./pages/ClassTop";
import ClassGuideList from "./pages/ClassGuideList";
import ClassGuideDetail from "./pages/ClassGuideDetail";
import ClassDetail from "./pages/ClassDetail";
import ClassReviewForm from "./pages/ClassReviewForm";
import Circle from "./pages/Circle";
import CircleDetail from "./pages/CircleDetail";
import CircleNoticeList from "./pages/CircleNoticeList";
import CircleReviewList from "./pages/CircleReviewList";
import CircleReviewForm from "./pages/CircleReviewForm";
import CircleEdit from "./pages/CircleEdit";
import GraduationCheck from "./pages/GraduationCheck";
import GraduationCheckTest from "./pages/GraduationCheckTest";
import { graduationCheckTestEnabled } from "./features/graduationCheck/testMode";
import GraduationCheckResult from "./pages/GraduationCheckResult";
import Timetable from "./pages/Timetable";
import TimetableShare from "./pages/TimetableShare";
import Notfound404 from "./pages/404";
import Contact from "./pages/Contact";
import LegalDocument from "./pages/LegalDocument";
import NewsList from "./pages/NewsList";
import TopicList from "./pages/TopicList";
import Career from "./pages/Career";
import CareerBasics from "./pages/CareerBasics";
import CareerInternships from "./pages/CareerInternships";
import CareerInternshipDetail from "./pages/CareerInternshipDetail";
import CareerAlumni from "./pages/CareerAlumni";
import CareerAlumniDetail from "./pages/CareerAlumniDetail";
import CareerArticleDetail from "./pages/CareerArticleDetail";
import Life from "./pages/Life";
import LifeCafeteria from "./pages/LifeCafeteria";
import CafeteriaReviewForm from "./pages/CafeteriaReviewForm";
import MyApplications from "./pages/MyApplications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInternships from "./pages/admin/AdminInternships";
import AdminInternshipForm from "./pages/admin/AdminInternshipForm";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminApplicationDetail from "./pages/admin/AdminApplicationDetail";
import AdminCareerContent from "./pages/admin/AdminCareerContent";
import AdminClassManagement from "./pages/admin/AdminClassManagement";
import AdminClassGuides from "./pages/admin/AdminClassGuides";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUniversities from "./pages/admin/AdminUniversities";
import AdminNews from "./pages/admin/AdminNews";
import AdminCompanyAccess from "./pages/admin/AdminCompanyAccess";
import CompanyLogin from "./pages/company/CompanyLogin";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyApplicationDetail from "./pages/company/CompanyApplicationDetail";
import "./styles/responsive.css";

function UniversityLayout() {
  const isDefaultLanding = useMatch(defaultUniversityPath);
  const { loading: universityLoading } = useUniversity();
  const { loading: authLoading } = useAuth();

  if (isDefaultLanding && (universityLoading || authLoading)) {
    return <main><LandingLoading /></main>;
  }
  return (
    <div className="universityAppShell">
      <InternalLinkGuard />
      <Header />
      <Outlet />
    </div>
  );
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}

const legacyRoots = [
  "login",
  "signup",
  "auth",
  "class",
  "graduation-checker",
  "timetable",
  "mypage",
  "contact",
  "terms",
  "privacy",
  "news",
  "topics",
  "career",
  "circles",
  "lifestyle",
  "life",
  "events",
  "global",
];

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SeoNavigation />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<><LandingLoading /><Navigate to={defaultUniversityPath} replace /></>} />
          <Route path="/404" element={<Notfound404 />} />
          <Route path="/company/login" element={<CompanyLogin />} />
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/company/applications/:id" element={<CompanyApplicationDetail />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
          <Route path="/admin/universities" element={<ProtectedAdmin><AdminUniversities /></ProtectedAdmin>} />
          <Route path="/admin/news" element={<ProtectedAdmin><AdminNews /></ProtectedAdmin>} />
          <Route path="/admin/company-access" element={<ProtectedAdmin><AdminCompanyAccess /></ProtectedAdmin>} />
          <Route path="/admin/internships" element={<ProtectedAdmin><AdminInternships /></ProtectedAdmin>} />
          <Route path="/admin/internships/new" element={<ProtectedAdmin><AdminInternshipForm /></ProtectedAdmin>} />
          <Route path="/admin/internships/:id/edit" element={<ProtectedAdmin><AdminInternshipForm /></ProtectedAdmin>} />
          <Route path="/admin/applications" element={<ProtectedAdmin><AdminApplications /></ProtectedAdmin>} />
          <Route path="/admin/applications/:id" element={<ProtectedAdmin><AdminApplicationDetail /></ProtectedAdmin>} />
          <Route path="/admin/career-content" element={<ProtectedAdmin><AdminCareerContent /></ProtectedAdmin>} />
          <Route path="/admin/class-management" element={<ProtectedAdmin><AdminClassManagement /></ProtectedAdmin>} />
          <Route path="/admin/class-guides" element={<ProtectedAdmin><AdminClassGuides /></ProtectedAdmin>} />

          <Route path="/:accountSlug/auth/forgot-password" element={<RequestPasswordReset />} />
          <Route path="/:accountSlug/auth/reset-password" element={<ResetPassword />} />

          {legacyRoots.map((root) => (
            <Route path={`/${root}/*`} element={<Navigate to="/" replace />} key={root} />
          ))}

          <Route path="/:universitySlug" element={<UniversityProvider><UniversityLayout /></UniversityProvider>}>
            <Route index element={<UniversityLanding />} />
            <Route element={<RequireActiveUniversity />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="auth/confirm" element={<Confirm />} />
              <Route path="contact" element={<Contact />} />
              <Route path="terms" element={<LegalDocument type="agreement" />} />
              <Route path="privacy" element={<LegalDocument type="privacy" />} />
            </Route>

            <Route element={<RequireUniversityAccess allowGuest />}>
              <Route path="mypage" element={<Navigate to=".." replace />} />
              <Route path="mypage/applications" element={<MyApplications />} />
              <Route path="career" element={<Career />} />
              <Route path="life" element={<Life />} />
              <Route path="life/cafeteria" element={<LifeCafeteria />} />
              <Route path="life/cafeteria/:cafeteriaId/review" element={<CafeteriaReviewForm />} />
              <Route path="circles/search" element={<Circle />} />
              <Route path="circles/:circleId" element={<CircleDetail />} />
              <Route path="circles/:circleId/notices" element={<CircleNoticeList />} />
              <Route path="circles/:circleId/reviews" element={<CircleReviewList />} />
              <Route path="circles/:circleId/review" element={<CircleReviewForm />} />
              {/* TODO: 団体責任者のみアクセス可（権限制御は後日実装） */}
              <Route path="circles/:circleId/edit" element={<CircleEdit />} />

              <Route element={<FeatureGate feature="news" />}>
                <Route path="news" element={<NewsList />} />
                <Route path="topics" element={<TopicList />} />
              </Route>
              <Route element={<FeatureGate feature="career_articles" />}>
                <Route path="career/basics" element={<CareerBasics />} />
                <Route path="career/articles/:id" element={<CareerArticleDetail />} />
              </Route>
              <Route element={<FeatureGate feature="internships" />}>
                <Route path="career/internships" element={<CareerInternships />} />
              </Route>
              <Route element={<FeatureGate feature="alumni_stories" />}>
                <Route path="career/alumni" element={<CareerAlumni />} />
                <Route path="career/alumni/:id" element={<CareerAlumniDetail />} />
                <Route path="career/stories" element={<Navigate to="../career/alumni" replace />} />
              </Route>
              <Route element={<FeatureGate feature="courses" />}>
                <Route path="class" element={<Class />} />
                <Route path="class/top" element={<ClassTop />} />
                <Route path="class/guides/:categorySlug" element={<ClassGuideList />} />
                <Route path="class/guide/:id" element={<ClassGuideDetail />} />
                <Route path="class/:courseCode" element={<ClassDetail />} />
              </Route>
              <Route element={<FeatureGate feature="class_reviews" />}>
                <Route path="class/:courseCode/review" element={<ClassReviewForm />} />
              </Route>
            </Route>

            <Route element={<RequireUniversityAccess />}>
              <Route element={<FeatureGate feature="internships" />}>
                <Route path="career/internships/:internshipId" element={<CareerInternshipDetail />} />
              </Route>
              <Route element={<FeatureGate feature="graduation_checker" />}>
                <Route path="graduation-checker" element={graduationCheckTestEnabled ? <GraduationCheckTest /> : <GraduationCheck />} />
                <Route path="graduation-checker/result" element={<GraduationCheckResult />} />
              </Route>
              <Route element={<FeatureGate feature="timetable" />}>
                <Route path="timetable" element={<Timetable />} />
                <Route path="timetable/share" element={<TimetableShare />} />
              </Route>
            </Route>
            <Route path="*" element={<Notfound404 />} />
          </Route>

          <Route path="*" element={<Notfound404 />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
