import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/utility/Header";
import ScrollToTop from "./components/utility/ScrollToTop";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Class from "./pages/Class";
import Notfound404 from "./pages/404";
import Confirm from "./components/auth/Confirm";
import Mypage from "./pages/Mypage"
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
          <Route path="/auth/confirm" element={<Confirm />} />
          <Route path="/mypage" element={<Mypage />} />

          {/* どのルートにもマッチしなかった場合は404ページを表示 */}
          <Route path="*" element={<Notfound404 />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
