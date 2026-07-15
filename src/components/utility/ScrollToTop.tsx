import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ページ遷移（pathname の変化）時に必ずページ最上部から表示するためのコンポーネント。
// hash（ページ内アンカー）だけの変化では発火しないため、アンカー遷移は妨げない。
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
