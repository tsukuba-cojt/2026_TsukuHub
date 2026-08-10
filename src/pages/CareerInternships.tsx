import { useEffect, useMemo, useState } from "react";
import CareerBreadcrumb from "../components/career/CareerBreadcrumb";
import CareerPageHeader from "../components/career/CareerPageHeader";
import InternshipFilters from "../components/career/InternshipFilters";
import InternshipList from "../components/career/InternshipList";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { listPublishedInternships } from "../services/careerService";
import type { Internship } from "../types/career";
import "../styles/career/CareerPlatform.css";

const allFilter = "すべて";

export default function CareerInternships() {
  const [items, setItems] = useState<Internship[]>([]);
  const [filter, setFilter] = useState(allFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime] = useState(() => Date.now());

  const load = () => {
    setLoading(true);
    setError("");
    void listPublishedInternships()
      .then(setItems)
      .catch(() =>
        setError(
          "求人情報を取得できませんでした。時間をおいて再度お試しください。",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void listPublishedInternships()
      .then(setItems)
      .catch(() =>
        setError(
          "求人情報を取得できませんでした。時間をおいて再度お試しください。",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          filter === allFilter ||
          (filter === "リモート可"
            ? item.is_remote
            : item.job_category.includes(filter)),
      ),
    [filter, items],
  );

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell">
        <CareerBreadcrumb
          items={[
            { label: "就活", to: "/career" },
            { label: "長期インターン" },
          ]}
        />
        <CareerPageHeader
          eyebrow="LONG-TERM INTERNSHIPS"
          title="長期インターン情報"
        >
          筑波大生におすすめの求人を掲載しています。現在 <strong>{items.length}件</strong>{" "}
          募集中です。
        </CareerPageHeader>
        <InternshipFilters activeFilter={filter} onChange={setFilter} />
        <InternshipList
          items={visible}
          loading={loading}
          error={error}
          currentTime={currentTime}
          onReload={load}
          onClearFilter={() => setFilter(allFilter)}
        />
      </main>
      <Footer />
    </div>
  );
}
