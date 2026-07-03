import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/utility/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Class from "./pages/Class";
import Notfound404 from "./pages/404";
import Confirm from "./components/auth/Confirm";
import Mypage from "./pages/Mypage"

function App() {
  return (
    <BrowserRouter>

      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/class" element={<Class />} />
        <Route path="/auth/confirm" element={<Confirm />} />
        <Route path="/mypage" element={<Mypage />} />

        {/* どのルートにもマッチしなかった場合は404ページを表示 */}
        <Route path="*" element={<Notfound404 />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
