import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CookingPot } from "lucide-react";
import { useUniversity } from "../components/university/universityContextValue";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import CafeteriaFilterBar from "../components/life/CafeteriaFilterBar";
import CafeteriaDetailPanel from "../components/life/CafeteriaDetailPanel";
import CafeteriaCardList from "../components/life/CafeteriaCardList";
import { mockCafeterias } from "../components/life/mockCafeterias";
import { searchCafeterias, type CafeteriaFilters } from "../lib/cafeteriaSearch";
import "../styles/class/Class.css";
import "../styles/class/ClassTop.css";
import "../styles/life/Cafeteria.css";

const DEFAULT_FILTERS: CafeteriaFilters = {
  category: "all",
  openOnly: false,
  payment: "all",
  sort: "recommended",
};

const CLOCK_INTERVAL_MS = 60_000;

function LifeCafeteria() {
  const { path } = useUniversity();
  const [filters, setFilters] = useState<CafeteriaFilters>(DEFAULT_FILTERS);
  const location = useLocation();
  // 口コミ投稿ページのパンくずから戻ったときは、その施設を選択した状態で開く
  const [selectedId, setSelectedId] = useState<string | null>(
    () => (location.state as { cafeteriaId?: string } | null)?.cafeteriaId ?? null,
  );
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), CLOCK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const results = useMemo(() => searchCafeterias(mockCafeterias, filters, now), [filters, now]);
  const selected = results.find((cafeteria) => cafeteria.id === selectedId) ?? results[0] ?? null;

  return (
    <div className="classPage">
      <Globalnav />
      <svg width="0" height="0" aria-hidden="true" focusable="false" className="cafeteriaSvgDefs">
        <defs>
          <linearGradient id="cafeteriaTitleGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="0">
            <stop offset="0%" stopColor="#1578FD" />
            <stop offset="100%" stopColor="#5E2CFC" />
          </linearGradient>
        </defs>
      </svg>
      <main className="classPageLayout">
        <p className="classBreadcrumb">
          <Link to={path()} className="classBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt;{" "}
          <Link to={path("/life")} className="classBreadcrumbLink">
            生活・便利情報
          </Link>{" "}
          &gt; 学食情報
        </p>

        <section className="classTopHero cafeteriaHero">
          <div className="classTopHeroText">
            <h1 className="classTopHeroTitle cafeteriaTitle">
              <CookingPot aria-hidden="true" />
              <span>学食情報</span>
            </h1>
            <p className="classTopHeroDesc cafeteriaDesc">
              キャンパス内の食堂をエリアごとにチェック。混雑の傾向や口コミから快適なランチタイムを
            </p>
          </div>
        </section>

        <CafeteriaFilterBar filters={filters} onChange={setFilters} />

        <div className="cafeteriaMain">
          <div className="cafeteriaMap" role="img" aria-label="キャンパスマップ（準備中）">
            <span aria-hidden="true">map</span>
          </div>
          <CafeteriaDetailPanel key={selected?.id ?? "empty"} cafeteria={selected} now={now} />
        </div>

        <CafeteriaCardList
          cafeterias={results}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
        />
      </main>
      <Footer />
    </div>
  );
}

export default LifeCafeteria;
