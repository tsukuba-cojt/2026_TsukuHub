import { useEffect, useMemo, useState } from "react";
import CareerPageHeader from "../components/career/CareerPageHeader";
import InternshipListingCard from "../components/career/InternshipListingCard";
import ListingPagination from "../components/career/ListingPagination";
import ListingResultBar from "../components/career/ListingResultBar";
import ListingSearchPanel from "../components/career/ListingSearchPanel";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { paginateItems } from "../lib/listingSearch";
import {
  collectInternshipFacets,
  filterInternships,
  isInternshipSearchFiltered,
  type InternshipSearchQuery,
  type InternshipSortKey,
} from "../lib/internshipSearch";
import { listPublishedInternships } from "../services/careerService";
import type { Internship } from "../types/career";
import { useUniversity } from "../components/university/universityContextValue";
import "../styles/career/CareerPlatform.css";

const emptyFilters = (): InternshipSearchQuery => ({
  query: "",
  jobCategory: null,
  location: null,
  workStyle: null,
  tag: null,
  remoteOnly: false,
  sort: "recommended",
});

const sortOptions: { key: InternshipSortKey; label: string }[] = [
  { key: "recommended", label: "おすすめ順" },
  { key: "newest", label: "新着順" },
  { key: "deadline", label: "締切順" },
];

export default function CareerInternships() {
  const { university } = useUniversity();
  const [items, setItems] = useState<Internship[]>([]);
  const [draftQuery, setDraftQuery] = useState("");
  const [filters, setFilters] = useState<InternshipSearchQuery>(emptyFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    if (!university) return;
    setLoading(true);
    setError("");
    void listPublishedInternships(university.id)
      .then(setItems)
      .catch(() =>
        setError("求人情報を取得できませんでした。時間をおいて再度お試しください。"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [university]);

  const facets = useMemo(() => collectInternshipFacets(items), [items]);
  const filtered = useMemo(() => filterInternships(items, filters), [filters, items]);
  const paged = useMemo(() => paginateItems(filtered, page), [filtered, page]);
  const filtering = isInternshipSearchFiltered(filters);

  const applyQuery = () => {
    setFilters((current) => ({ ...current, query: draftQuery }));
    setPage(1);
  };

  const updateFilter = (patch: Partial<InternshipSearchQuery>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const clearFilters = () => {
    setDraftQuery("");
    setFilters((current) => ({ ...emptyFilters(), sort: current.sort }));
    setPage(1);
  };

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell">
        <CareerPageHeader eyebrow="LONG-TERM INTERNSHIPS" title="おすすめの長期インターン">
          {university?.short_name}生におすすめの求人を、キーワードや職種から探せます。
        </CareerPageHeader>

        {loading ? (
          <div className="careerState">求人を読み込んでいます...</div>
        ) : error ? (
          <div className="careerState isError">
            <p>{error}</p>
            <button type="button" onClick={load}>
              再読み込み
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="careerState">
            <h2>まだ掲載がありません</h2>
            <p>{university?.name}のおすすめ長期インターンを準備中です。</p>
          </div>
        ) : (
          <div className="listingSearchLayout">
            <ListingSearchPanel
              draftQuery={draftQuery}
              searchLabel="インターンのキーワード検索"
              hasFilter={filtering}
              groups={[
                {
                  title: "職種",
                  items: facets.jobCategories,
                  selected: filters.jobCategory,
                  onSelect: (jobCategory) => updateFilter({ jobCategory }),
                },
                {
                  title: "勤務地",
                  items: facets.locations,
                  selected: filters.location,
                  onSelect: (location) => updateFilter({ location }),
                },
                {
                  title: "働き方",
                  items: facets.workStyles,
                  selected: filters.workStyle,
                  onSelect: (workStyle) => updateFilter({ workStyle }),
                },
                {
                  title: "リモート",
                  items: facets.hasRemote ? ["リモート可"] : [],
                  selected: filters.remoteOnly ? "リモート可" : null,
                  onSelect: (value) => updateFilter({ remoteOnly: value === "リモート可" }),
                },
                {
                  title: "タグ",
                  items: facets.tags,
                  selected: filters.tag,
                  onSelect: (tag) => updateFilter({ tag }),
                },
              ]}
              onDraftQueryChange={setDraftQuery}
              onSearch={applyQuery}
              onClear={clearFilters}
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
                  <h2>条件に合う求人がありません</h2>
                  <p>キーワードやカテゴリーを変えて、もう一度探してみてください。</p>
                </div>
              ) : (
                <div className="alumniGrid">
                  {paged.items.map((internship) => (
                    <InternshipListingCard internship={internship} key={internship.id} />
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
