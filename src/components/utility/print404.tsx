import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/utility/print404.css";
import searchIcon from "../../assets/utility/header_footer/Search.svg";
import searchIllust from "../../assets/NotFound/SearchIllust.svg";

export default function Notfound404() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="nf-page">
      <div className="nf-inner">
        {/* Left column */}
        <div className="nf-left">
          <h1 className="nf-code">404</h1>
          <h2 className="nf-title">ページが見つかりません</h2>
          <p className="nf-body">
            お探しのページは存在しないか、<br />
            移動・削除された可能性があります。<br />
            <br />
            URLをご確認いただくか、<br />
            以下から目的のページを探してみて下さい。
          </p>

          <form className="nf-search-form" onSubmit={handleSearchSubmit}>
            <div className="nf-search-box">
              <input
                type="text"
                className="nf-search-input"
                placeholder="キーワードで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="nf-search-btn" aria-label="検索">
                <img
                  src={searchIcon}
                  alt=""
                  className="nf-search-icon"
                />
              </button>
            </div>
          </form>

          <div className="nf-buttons">
            <button
              className="nf-btn nf-btn-back"
              onClick={() => navigate(-1)}
            >
              <span className="nf-btn-back-text">← 前のページへ戻る</span>
            </button>
            <Link to="/" className="nf-btn nf-btn-home">
              トップページへ戻る
            </Link>
          </div>
        </div>

        {/* Right column — illustration */}
        <div className="nf-right">
          <img
            src={searchIllust}
            alt=""
            className="nf-illust"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
