import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CookingPot } from "lucide-react";
import { useUniversity } from "../components/university/universityContextValue";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import CafeteriaFilterBar from "../components/life/CafeteriaFilterBar";
import CafeteriaDetailPanel from "../components/life/CafeteriaDetailPanel";
import CafeteriaCardList from "../components/life/CafeteriaCardList";
import CafeteriaMap from "../components/life/CafeteriaMap";
import { mockCafeterias } from "../components/life/mockCafeterias";
import { listMenuPhotos, type MenuPhoto } from "../services/cafeteriaMenuService";
import { japanMenuDate } from "../lib/cafeteriaMenu";
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
  const { path, university } = useUniversity();
  const [menuData, setMenuData] = useState<{ universityId: string; date: string; menus: MenuPhoto[] } | null>(null);
  const [menuError, setMenuError] = useState(false);
  const menuDate = japanMenuDate();
  useEffect(() => {
    if (!university) return;
    let active = true;
    const refresh = () => void listMenuPhotos(university.id, menuDate).then((menus) => {
      if (active) { setMenuData({ universityId: university.id, date: menuDate, menus }); setMenuError(false); }
    }).catch(() => { if (active) setMenuError(true); });
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    const focus = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", focus);
    return () => { active = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", focus); };
  }, [university, menuDate]);
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

  const cafeterias = useMemo(() => mockCafeterias.map((cafeteria) => {
    const menu = menuData?.universityId === university?.id && menuData?.date === menuDate
      ? menuData.menus.find((item) => item.cafeteria_id === cafeteria.id) : null;
    return menu ? { ...cafeteria, menuPhotoUrl: menu.url, menuUpdatedAt: menu.updated_at } : cafeteria;
  }), [menuData, university, menuDate]);
  const results = useMemo(() => searchCafeterias(cafeterias, filters, now), [cafeterias, filters, now]);
  const selected = results.find((cafeteria) => cafeteria.id === selectedId) ?? results[0] ?? null;

  return (
    <div className="classPage">
      <Globalnav />
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
          <Link to="/cafeteria-staff" className="cafeteriaStaffLink">学食スタッフ</Link>
        </section>

        <CafeteriaFilterBar filters={filters} onChange={setFilters} />
        {menuError && <p role="status">最新メニューを取得できませんでした。表示内容は最新でない場合があります。</p>}

        <div className="cafeteriaMain">
          <CafeteriaMap cafeterias={results} selected={selected} onSelect={setSelectedId} />
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
