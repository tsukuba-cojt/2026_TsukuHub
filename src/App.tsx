import Home from "./pages/Home";
import Auth from "./pages/Auth";

function App() {
  const path = window.location.pathname;

  if (path === '/auth') {
    return <Auth />;
  }
  
  return <Home />;
}

export default App;