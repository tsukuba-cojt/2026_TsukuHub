import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Header from "./components/utility/Header";
import InternalLinkGuard from "./components/utility/InternalLinkGuard";
import ScrollToTop from "./components/utility/ScrollToTop";
import { AuthProvider } from "./components/auth/AuthContext";
import RequireAdmin from "./components/auth/RequireAdmin";
import RequireAuth from "./components/auth/RequireAuth";
import RequireUniversityAccess from "./components/auth/RequireUniversityAccess";
import Confirm from "./components/auth/Confirm";
import FeatureGate from "./components/university/FeatureGate";
import UniversityProvider from "./components/university/UniversityProvider";
import RequireActiveUniversity from "./components/university/RequireActiveUniversity";
import UniversityPortal from "./pages/UniversityPortal";
import UniversityLanding from "./pages/UniversityLanding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Class from "./pages/Class";
import ClassTop from "./pages/ClassTop";
import ClassGuideList from "./pages/ClassGuideList";
import ClassGuideDetail from "./pages/ClassGuideDetail";
import ClassDetail from "./pages/ClassDetail";
import ClassReviewForm from "./pages/ClassReviewForm";
import GraduationCheck from "./pages/GraduationCheck";
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
import MyApplications from "./pages/MyApplications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInternships from "./pages/admin/AdminInternships";
import AdminInternshipForm from "./pages/admin/AdminInternshipForm";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminApplicationDetail from "./pages/admin/AdminApplicationDetail";
import AdminCareerContent from "./pages/admin/AdminCareerContent";
import AdminClassManagement from "./pages/admin/AdminClassManagement";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUniversities from "./pages/admin/AdminUniversities";
import AdminNews from "./pages/admin/AdminNews";
import "./styles/responsive.css";

function UniversityLayout() {
  return (
    <UniversityProvider>
      <div className="universityAppShell">
        <InternalLinkGuard />
        <Header />
        <Outlet />
      </div>
    </UniversityProvider>
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
  "events",
  "global",
];

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<UniversityPortal />} />
          <Route path="/404" element={<Notfound404 />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
          <Route path="/admin/universities" element={<ProtectedAdmin><AdminUniversities /></ProtectedAdmin>} />
          <Route path="/admin/news" element={<ProtectedAdmin><AdminNews /></ProtectedAdmin>} />
          <Route path="/admin/internships" element={<ProtectedAdmin><AdminInternships /></ProtectedAdmin>} />
          <Route path="/admin/internships/new" element={<ProtectedAdmin><AdminInternshipForm /></ProtectedAdmin>} />
          <Route path="/admin/internships/:id/edit" element={<ProtectedAdmin><AdminInternshipForm /></ProtectedAdmin>} />
          <Route path="/admin/applications" element={<ProtectedAdmin><AdminApplications /></ProtectedAdmin>} />
          <Route path="/admin/applications/:id" element={<ProtectedAdmin><AdminApplicationDetail /></ProtectedAdmin>} />
          <Route path="/admin/career-content" element={<ProtectedAdmin><AdminCareerContent /></ProtectedAdmin>} />
          <Route path="/admin/class-management" element={<ProtectedAdmin><AdminClassManagement /></ProtectedAdmin>} />

          {legacyRoots.map((root) => (
            <Route path={`/${root}/*`} element={<Navigate to="/" replace />} key={root} />
          ))}

          <Route path="/:universitySlug" element={<UniversityLayout />}>
            <Route index element={<UniversityLanding />} />
            <Route element={<RequireActiveUniversity />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="auth/confirm" element={<Confirm />} />
              <Route path="contact" element={<Contact />} />
              <Route path="terms" element={<LegalDocument type="agreement" />} />
              <Route path="privacy" element={<LegalDocument type="privacy" />} />
            </Route>

            <Route element={<RequireUniversityAccess />}>
              <Route path="mypage" element={<Navigate to=".." replace />} />
              <Route path="mypage/applications" element={<MyApplications />} />
              <Route path="career" element={<Career />} />

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
                <Route path="career/internships/:internshipId" element={<CareerInternshipDetail />} />
              </Route>
              <Route element={<FeatureGate feature="alumni_stories" />}>
                <Route path="career/alumni" element={<CareerAlumni />} />
                <Route path="career/alumni/:id" element={<CareerAlumniDetail />} />
                <Route path="career/stories" element={<CareerAlumni />} />
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
              <Route element={<FeatureGate feature="graduation_checker" />}>
                <Route path="graduation-checker" element={<GraduationCheck />} />
                <Route path="graduation-checker/result" element={<GraduationCheckResult />} />
              </Route>
              <Route element={<FeatureGate feature="timetable" />}>
                <Route path="timetable" element={<Timetable />} />
                <Route
                  path="timetable/share"
                  element={
                    <RequireAuth>
                      <TimetableShare />
                    </RequireAuth>
                  }
                />
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
