import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/utility/Header";
import ScrollToTop from "./components/utility/ScrollToTop";
import { AuthProvider } from "./components/auth/AuthContext";
import RequireAuth from "./components/auth/RequireAuth";
import RequireAdmin from "./components/auth/RequireAdmin";
import Confirm from "./components/auth/Confirm";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Class from "./pages/Class";
import ClassTop from "./pages/ClassTop";
import ClassDetail from "./pages/ClassDetail";
import ClassReviewForm from "./pages/ClassReviewForm";
import GraduationCheck from "./pages/GraduationCheck";
import GraduationCheckResult from "./pages/GraduationCheckResult";
import Notfound404 from "./pages/404";
import Mypage from "./pages/Mypage";
import Contact from "./pages/Contact";
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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/confirm" element={<Confirm />} />
          <Route path="/class" element={<RequireAuth><Class /></RequireAuth>} />
          <Route path="/class/top" element={<ClassTop />} />
          <Route path="/class/:courseCode" element={<ClassDetail />} />
          <Route
            path="/class/:courseCode/review"
            element={
              <RequireAuth>
                <ClassReviewForm />
              </RequireAuth>
            }
          />
          <Route path="/graduation-checker" element={<GraduationCheck />} />
          <Route path="/graduation-checker/result" element={<GraduationCheckResult />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/mypage/applications" element={<RequireAuth><MyApplications /></RequireAuth>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/career" element={<Career />} />
          <Route path="/career/basics" element={<CareerBasics />} />
          <Route path="/career/articles/:id" element={<CareerArticleDetail />} />
          <Route path="/career/internships" element={<CareerInternships />} />
          <Route path="/career/internships/:internshipId" element={<CareerInternshipDetail />} />
          <Route path="/career/alumni" element={<CareerAlumni />} />
          <Route path="/career/alumni/:id" element={<CareerAlumniDetail />} />
          <Route path="/career/stories" element={<CareerAlumni />} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/internships" element={<RequireAdmin><AdminInternships /></RequireAdmin>} />
          <Route path="/admin/internships/new" element={<RequireAdmin><AdminInternshipForm /></RequireAdmin>} />
          <Route path="/admin/internships/:id/edit" element={<RequireAdmin><AdminInternshipForm /></RequireAdmin>} />
          <Route path="/admin/applications" element={<RequireAdmin><AdminApplications /></RequireAdmin>} />
          <Route path="/admin/applications/:id" element={<RequireAdmin><AdminApplicationDetail /></RequireAdmin>} />
          <Route path="/admin/career-content" element={<RequireAdmin><AdminCareerContent /></RequireAdmin>} />
          <Route path="/admin/class-management" element={<RequireAdmin><AdminClassManagement /></RequireAdmin>} />
          <Route path="*" element={<Notfound404 />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
