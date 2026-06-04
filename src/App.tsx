import Home from "./pages/Home";
import Class from "./pages/class";
import Login from "./pages/login";
import ClassDetail from "./pages/classdetail";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/class" element={<Class />} />
        <Route path="/login" element={<Login />} />
        <Route path="/class/:id" element={<ClassDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;