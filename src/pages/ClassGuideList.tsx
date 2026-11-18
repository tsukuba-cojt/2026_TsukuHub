import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CareerPageHeader from "../components/career/CareerPageHeader";
import ListingPagination from "../components/career/ListingPagination";
import ListingResultBar from "../components/career/ListingResultBar";
import ClassGuideListCard from "../components/class/ClassGuideListCard";
import ClassGuideSearchPanel from "../components/class/ClassGuideSearchPanel";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { classGuideCategories, classGuideCategoryFromSlug } from "../data/classGuideCategories";
import {
  filterClassGuideArticles,
  isClassGuideSearchFiltered,
  type ClassGuideSearchQuery,
  type ClassGuideSortKey,
} from "../lib/classGuideSearch";
import { paginateItems } from "../lib/listingSearch";
import { listPublishedClassGuides } from "../services/classGuideService";
import { useUniversity } from "../components/university/universityContextValue";
import type { ClassGuideArticleRecord } from "../types/classGuide";
import "../styles/class/Class.css";
import "../styles/class/ClassGuide.css";
import "../styles/career/CareerPlatform.css";

const emptyFilters = (): ClassGuideSearchQuery => ({
  query: "",
  sort: "recommended",
});

const sortOptions: { key: ClassGuideSortKey; label: string }[] = [
  { key: "recommended", label: "おすすめ順" },
  { key: "newest", label: "新着順" },
];

export default function ClassGuideList() {
  const { categorySlug } = useParams();
  const { university, path } = useUniversity();
  const category = categorySlug ? classGuideCategoryFromSlug(categorySlug) : null;
  const [articles, setArticles] = useState<ClassGuideArticleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftQuery, setDraftQuery] = useState("");
  const [filters, setFilters] = useState<ClassGuideSearchQuery>(emptyFilters);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!university || !category) return;
    setLoading(true);
    void listPublishedClassGuides(university.id, category)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [university, category]);

  useEffect(() => {
    setDraftQuery("");
    setFilters(emptyFilters());
    setPage(1);
  }, [category]);

  const filtered = useMemo(
    () => filterClassGuideArticles(articles, filters),
    [articles, filters],
  );
  const paged = useMemo(() => paginateItems(filtered, page), [filtered, page]);
  const filtering = isClassGuideSearchFiltered(filters);

  const applyQuery = () => {
    setFilters((current) => ({ ...current, query: draftQuery }));
    setPage(1);
  };

  const updateFilter = (patch: Partial<ClassGuideSearchQuery>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  if (!category) {
    return (
      <div className="classPage">
        <Globalnav />
        <main className="classPageLayout classGuideListPage careerState">
          <p>カテゴリが見つかりません。</p>
          <Link to={path("/class/top")}>授業・履修トップへ戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const meta = classGuideCategories[category];

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout classGuideListPage">
        <nav className="careerBreadcrumb" aria-label="パンくずリスト">
          <Link to={path("/class/top")}>授業・履修</Link>
          <ChevronRight aria-hidden="true" />
          <span>{meta.label}</span>
        </nav>

        <CareerPageHeader eyebrow={meta.sectionLabel} title={meta.label}>
          {meta.description}
        </CareerPageHeader>

        {loading ? (
          <div className="careerInlineState">読み込んでいます...</div>
        ) : articles.length === 0 ? (
          <div className="careerState">
            <h2>まだ掲載がありません</h2>
            <p>{university?.name}の{meta.label}記事を準備中です。</p>
            <Link to={path("/class/top")}>授業・履修トップへ戻る</Link>
          </div>
        ) : (
          <div className="listingSearchLayout classGuideListLayout">
            <ClassGuideSearchPanel
              activeCategory={category}
              draftQuery={draftQuery}
              hasFilter={filtering}
              onDraftQueryChange={setDraftQuery}
              onSearch={applyQuery}
              onClear={() => {
                setDraftQuery("");
                setFilters((current) => ({ ...emptyFilters(), sort: current.sort }));
                setPage(1);
              }}
            />

            <div className="listingSearchResults">
              <ListingResultBar
                start={paged.start}
                end={paged.end}
                total={paged.total}
                filtering={filtering}
                sort={filters.sort}
                sortOptions={sortOptions}
                onSort={(sort) => updateFilter({ sort })}
              />

              {paged.items.length === 0 ? (
                <div className="careerState">
                  <h2>条件に合う記事がありません</h2>
                  <p>キーワードを変えて、もう一度探してみてください。</p>
                </div>
              ) : (
                <div className="classGuideListStack">
                  {paged.items.map((article) => (
                    <ClassGuideListCard key={article.id} article={article} />
                  ))}
                </div>
              )}

              <ListingPagination
                page={page}
                pageCount={paged.pageCount}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
