import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Clock3,
  Laptop,
  MapPin,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { internships } from "../data/internships";
import "../styles/career/CareerInternships.css";

const filterLabels = ["すべて", "リモート可", "未経験歓迎", "週2日から", "1・2年生歓迎", "高時給", "新着求人"] as const;
type FilterLabel = typeof filterLabels[number];

export default function CareerInternships() {
  const [activeFilters, setActiveFilters] = useState<FilterLabel[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);

  const toggleFilter = (filter: FilterLabel) => {
    setVisibleCount(4);
    if (filter === "すべて") {
      setActiveFilters([]);
      return;
    }
    setActiveFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]
    );
  };

  const filtered = useMemo(() => internships.filter((item) =>
    activeFilters.every((filter) => {
      if (filter === "リモート可") return item.remote;
      if (filter === "未経験歓迎") return item.beginner;
      if (filter === "週2日から") return item.minDays <= 2;
      if (filter === "1・2年生歓迎") return item.youngerWelcome;
      if (filter === "高時給") return item.salaryMin >= 1500;
      if (filter === "新着求人") return item.isNew;
      return true;
    })
  ), [activeFilters]);

  return (
    <div className="internPage">
      <Globalnav />
      <main>
        <div className="internContainer">
          <nav className="internBreadcrumb" aria-label="パンくずリスト">
            <Link to="/">ホーム</Link><ChevronRight />
            <Link to="/career">就活・キャリア</Link><ChevronRight />
            <span>長期インターン情報</span>
          </nav>

          <header className="internTitle">
            <span>LONG-TERM INTERNSHIP</span>
            <h1>長期インターン情報</h1>
            <p>筑波大生におすすめの長期インターンを、希望する条件から簡単に探せます。</p>
          </header>

          <section className="internQuickSection" aria-labelledby="quick-filter-title">
            <div className="internQuickHeading">
              <div><Sparkles /><h2 id="quick-filter-title">希望する条件を選ぶ</h2></div>
              {activeFilters.length > 0 && <span>{activeFilters.length}件の条件を選択中</span>}
            </div>
            <div className="internQuickFilters">
              {filterLabels.map((label) => {
                const active = label === "すべて" ? activeFilters.length === 0 : activeFilters.includes(label);
                return (
                  <button
                    type="button"
                    key={label}
                    className={active ? "isActive" : ""}
                    aria-pressed={active}
                    onClick={() => toggleFilter(label)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="internListings" aria-labelledby="intern-list-title">
            <div className="internListingHeader">
              <div>
                <h2 id="intern-list-title">募集中のインターン</h2>
                <p><strong>{filtered.length}</strong>件の求人を表示しています</p>
              </div>
            </div>

            <div className="internCards">
              {filtered.length > 0 ? filtered.slice(0, visibleCount).map((item) => (
                <article className="internCard" key={item.id}>
                  <div className="internCardLogo" style={{ background: item.color }}>{item.initials}</div>
                  <div className="internCardBody">
                    <div className="internCardBadges">
                      {item.isNew && <span className="isNew">NEW</span>}
                      {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                    <h3>{item.title}</h3>
                    <p className="internCardCompany">{item.company}</p>
                    <div className="internCardDetails">
                      <span><BriefcaseBusiness />{item.role}</span>
                      <span><Laptop />{item.remote ? "リモート可" : "出社勤務"}</span>
                      <span><Clock3 />週{item.minDays}日〜</span>
                      <span><WalletCards />{item.salaryLabel}</span>
                    </div>
                    <div className="internRecommendation">
                      <Sparkles />
                      <div><strong>筑波大生におすすめ</strong><p>{item.recommendation}</p></div>
                    </div>
                    <div className="internCardFooter">
                      <span><MapPin />{item.location}</span>
                      <Link to={`/career/internships/${item.id}`}>詳細を見る<ArrowRight /></Link>
                    </div>
                  </div>
                </article>
              )) : (
                <div className="internEmpty">
                  <BriefcaseBusiness />
                  <h3>選択した条件に合う求人はありません</h3>
                  <p>条件を減らすか、「すべて」を選んでご確認ください。</p>
                  <button type="button" onClick={() => toggleFilter("すべて")}>すべての求人を見る</button>
                </div>
              )}
            </div>

            {visibleCount < filtered.length && (
              <button className="internLoadMore" type="button" onClick={() => setVisibleCount((count) => count + 4)}>
                もっと見る<ChevronDown />
              </button>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
