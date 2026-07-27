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
import GraduationCheck from "./pages/GraduationCheck";
import GraduationCheckResult from "./pages/GraduationCheckResult";
import Timetable from "./pages/Timetable";
import Notfound404 from "./pages/404";
import Confirm from "./components/auth/Confirm";
import Mypage from "./pages/Mypage"
import Contact from "./pages/Contact";
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
        {/* 卒業要件チェック（パスは classMenuItems.ts の定義に合わせる） */}
          <Route path="/graduation-checker" element={<GraduationCheck />} />
          <Route path="/graduation-checker/result" element={<GraduationCheckResult />} />
        {/* みんなの時間割（パスは classMenuItems.ts の定義に合わせる） */}
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/auth/confirm" element={<Confirm />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/contact" element={<Contact />} />

          {/* どのルートにもマッチしなかった場合は404ページを表示 */}
          <Route path="*" element={<Notfound404 />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
