import { useEffect, useMemo, useState } from "react";
import CareerArticleCard from "../components/career/CareerArticleCard";
import CareerPageHeader from "../components/career/CareerPageHeader";
import ListingPagination from "../components/career/ListingPagination";
import ListingResultBar from "../components/career/ListingResultBar";
import ListingSearchPanel from "../components/career/ListingSearchPanel";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import {
  collectArticleFacets,
  filterCareerArticles,
  isArticleSearchFiltered,
  type ArticleSearchQuery,
  type ArticleSortKey,
} from "../lib/articleSearch";
import { paginateItems } from "../lib/listingSearch";
import { listPublishedCareerArticles } from "../services/contentService";
import { useUniversity } from "../components/university/universityContextValue";
import type { CareerArticleRecord } from "../types/content";
import "../styles/career/CareerPlatform.css";

const emptyFilters = (): ArticleSearchQuery => ({
  query: "",
  category: null,
  sort: "recommended",
});

const sortOptions: { key: ArticleSortKey; label: string }[] = [
  { key: "recommended", label: "おすすめ順" },
  { key: "newest", label: "新着順" },
];

export default function CareerBasics() {
  const { university } = useUniversity();
  const [articles, setArticles] = useState<CareerArticleRecord[]>([]);
  const [draftQuery, setDraftQuery] = useState("");
  const [filters, setFilters] = useState<ArticleSearchQuery>(emptyFilters);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!university) return;
    void listPublishedCareerArticles(university.id)
      .then(setArticles)
      .catch(() => setArticles([]));
  }, [university]);

  const facets = useMemo(() => collectArticleFacets(articles), [articles]);
  const filtered = useMemo(() => filterCareerArticles(articles, filters), [articles, filters]);
  const paged = useMemo(() => paginateItems(filtered, page), [filtered, page]);
  const filtering = isArticleSearchFiltered(filters);

  const applyQuery = () => {
    setFilters((current) => ({ ...current, query: draftQuery }));
    setPage(1);
  };

  const updateFilter = (patch: Partial<ArticleSearchQuery>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell">
        <CareerPageHeader eyebrow="CAREER BASICS" title="就活・長期インターンの基礎知識">
          就活の全体像から、応募書類や面接まで。キーワードやテーマから一つずつ確認できます。
        </CareerPageHeader>

        {articles.length === 0 ? (
          <div className="careerState">
            <h2>まだ掲載がありません</h2>
            <p>{university?.name}の基礎知識を準備中です。</p>
          </div>
        ) : (
          <div className="listingSearchLayout">
            <ListingSearchPanel
              draftQuery={draftQuery}
              searchLabel="基礎知識のキーワード検索"
              hasFilter={filtering}
              groups={[
                {
                  title: "テーマ",
                  items: facets.categories,
                  selected: filters.category,
                  onSelect: (category) => updateFilter({ category }),
                },
              ]}
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
                  <p>キーワードやカテゴリーを変えて、もう一度探してみてください。</p>
                </div>
              ) : (
                <div className="alumniGrid">
                  {paged.items.map((article) => (
                    <CareerArticleCard article={article} key={article.id} />
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
