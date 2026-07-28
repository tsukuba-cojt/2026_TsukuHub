import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/utility/Header";
import ScrollToTop from "./components/utility/ScrollToTop";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Class from "./pages/Class";
import ClassTop from "./pages/ClassTop";
import ClassDetail from "./pages/ClassDetail";
import ClassReviewForm from "./pages/ClassReviewForm";
import Notfound404 from "./pages/404";
import Confirm from "./components/auth/Confirm";
import Mypage from "./pages/Mypage"
import Contact from "./pages/Contact";
import Career from "./pages/Career";
import CareerBasics from "./pages/CareerBasics";
import CareerInternships from "./pages/CareerInternships";
import CareerInternshipDetail from "./pages/CareerInternshipDetail";
import CareerStories from "./pages/CareerStories";
import { AuthProvider } from "./components/auth/AuthContext";
import RequireAuth from "./components/auth/RequireAuth";

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
          {/* 会員限定ページは RequireAuth でラップする（未ログイン時はオーバーレイ表示） */}
          <Route path="/class" element={<RequireAuth><Class /></RequireAuth>} />
        {/* 授業・履修トップ（静的セグメントのため :courseCode より優先される） */}
          <Route path="/class/top" element={<ClassTop />} />
          <Route path="/class/:courseCode" element={<ClassDetail />} />
        {/* 会員限定ページは RequireAuth でラップする（未ログイン時はオーバーレイ表示） */}
          <Route
            path="/class/:courseCode/review"
            element={
              <RequireAuth>
                <ClassReviewForm />
              </RequireAuth>
            }
          />
          <Route path="/auth/confirm" element={<Confirm />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/career" element={<Career />} />
          <Route path="/career/basics" element={<CareerBasics />} />
          <Route path="/career/internships" element={<CareerInternships />} />
          <Route path="/career/internships/:internshipId" element={<CareerInternshipDetail />} />
          <Route path="/career/stories" element={<CareerStories />} />

          {/* どのルートにもマッチしなかった場合は404ページを表示 */}
          <Route path="*" element={<Notfound404 />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
