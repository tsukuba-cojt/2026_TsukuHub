import { Link } from "react-router-dom";
import { useOptionalUniversity } from "../university/universityContextValue";
import "../../styles/auth/Unauthorized.css";

// Figma: 401 Unauthorized #2657:1516 → 鍵アイコン 120×133px
// SVG の fill にはトークンを直接使えないため、--color-main-gradient と同じ色をグラデ定義で再現
function KeyIcon() {
  return (
    <svg
      width="72"
      height="80"
      viewBox="0 0 272 301"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="unauthorized-key"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="unauthorized-key-gradient"
          x1="0"
          y1="0"
          x2="272"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1578FD" />
          <stop offset="1" stopColor="#5E2CFC" />
        </linearGradient>
      </defs>
      <path
        d="M256.578 116.017C247.281 106.684 234.247 100.86 220.037 100.879H214.773V78.9061C214.783 57.1724 205.909 37.3311 191.653 23.1117C177.424 8.8554 157.592 -0.00939877 135.858 7.47816e-06C114.124 -0.00939877 94.283 8.8554 80.0543 23.1117C65.8073 37.3311 56.9337 57.1724 56.9431 78.9061V100.879H51.6703C37.4598 100.86 24.4345 106.684 15.1382 116.017C5.81484 125.313 -0.00939487 138.338 1.13763e-05 152.558V249.321C-0.00939487 263.541 5.81484 276.566 15.1382 285.862C24.4345 295.195 37.4598 301.009 51.6703 301H220.037C234.247 301.009 247.282 295.195 256.578 285.862C265.901 276.565 271.725 263.54 271.716 249.321V152.558C271.725 138.338 265.901 125.312 256.578 116.017ZM91.1142 78.9061C91.1236 66.5051 96.0931 55.4269 104.222 47.2699C112.37 39.15 123.448 34.1711 135.858 34.1711C148.268 34.1711 159.346 39.15 167.494 47.2699C175.623 55.4269 180.593 66.5051 180.602 78.9061V100.879H91.1142V78.9061ZM232.419 261.703C229.195 264.9 224.923 266.829 220.036 266.829H51.6703C46.7832 266.829 42.521 264.9 39.297 261.703C36.1 258.488 34.1806 254.207 34.1712 249.32V152.558C34.1806 147.662 36.1 143.39 39.297 140.175C42.521 136.978 46.7832 135.049 51.6703 135.049H220.037C224.924 135.049 229.195 136.978 232.42 140.175C235.607 143.39 237.536 147.661 237.545 152.558V249.321C237.535 254.207 235.607 258.488 232.419 261.703Z"
        fill="url(#unauthorized-key-gradient)"
      />
      <path
        d="M135.849 164.591C122.263 164.591 111.249 175.614 111.249 189.209C111.249 199.221 117.257 207.801 125.845 211.641L120.407 246.969H135.849H151.308L145.862 211.641C154.45 207.801 160.467 199.221 160.467 189.209C160.467 175.614 149.444 164.591 135.849 164.591Z"
        fill="url(#unauthorized-key-gradient)"
      />
    </svg>
  );
}

// Figma: 401 Unauthorized #2351:1159
// 未ログインで保護ページを開いたときに、ページ本体の上へ重ねるオーバーレイ
export default function Unauthorized() {
  const universityContext = useOptionalUniversity();
  const path = universityContext?.path ?? ((pathname = "") => pathname || "/");
  return (
    <div className="unauthorized-overlay" role="dialog" aria-modal="true">
      <div className="unauthorized-content">
        <KeyIcon />
        <h2 className="unauthorized-heading">
          情報の閲覧には
          <span className="unauthorized-highlight">ログイン</span>
          が必要です
        </h2>
        <div className="unauthorized-actions">
          <Link to={path("/login")} className="unauthorized-btn unauthorized-btn-login">
            ログイン
          </Link>
          <Link to={path("/signup")} className="unauthorized-btn unauthorized-btn-register">
            新規登録
          </Link>
        </div>
        <Link to={path()} className="unauthorized-btn-return">
          <span className="unauthorized-btn-return-label">← トップページへ戻る</span>
        </Link>
      </div>
    </div>
  );
}
