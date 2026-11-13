import { useEffect, useMemo, useState } from "react";
import AlumniSearchPanel from "../components/career/AlumniSearchPanel";
import AlumniStoryCard from "../components/career/AlumniStoryCard";
import CareerPageHeader from "../components/career/CareerPageHeader";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import {
  collectAlumniFacets,
  filterAlumniStories,
  isAlumniSearchFiltered,
  paginateAlumniStories,
  type AlumniSearchQuery,
  type AlumniSortKey,
} from "../lib/alumniSearch";
import { listPublishedAlumniStories } from "../services/contentService";
import { useUniversity } from "../components/university/universityContextValue";
import type { AlumniStoryRecord } from "../types/content";
import "../styles/career/CareerPlatform.css";

const emptyFilters = (): AlumniSearchQuery => ({
  query: "",
  faculty: null,
  destination: null,
  jobRole: null,
  tag: null,
  sort: "recommended",
});

const sortOptions: { key: AlumniSortKey; label: string }[] = [
  { key: "recommended", label: "おすすめ順" },
  { key: "newest", label: "新着順" },
  { key: "year", label: "卒業年度順" },
];

export default function CareerAlumni() {
  const { university } = useUniversity();
  const [stories, setStories] = useState<AlumniStoryRecord[]>([]);
  const [draftQuery, setDraftQuery] = useState("");
  const [filters, setFilters] = useState<AlumniSearchQuery>(emptyFilters);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!university) return;
    void listPublishedAlumniStories(university.id).then(setStories).catch(() => setStories([]));
  }, [university]);

  const facets = useMemo(() => collectAlumniFacets(stories), [stories]);
  const filtered = useMemo(() => filterAlumniStories(stories, filters), [filters, stories]);
  const paged = useMemo(() => paginateAlumniStories(filtered, page), [filtered, page]);
  const filtering = isAlumniSearchFiltered(filters);

  const applyQuery = () => {
    setFilters((current) => ({ ...current, query: draftQuery }));
    setPage(1);
  };

  const updateFilter = (patch: Partial<AlumniSearchQuery>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell">
        <CareerPageHeader
          eyebrow="ALUMNI STORIES"
          title="卒業生のキャリア・体験記"
        >
          進路に正解は一つではありません。キーワードや職種から、考え方や行動のヒントを探せます。
        </CareerPageHeader>

        {stories.length === 0 ? (
          <div className="careerState">
            <h2>まだ掲載がありません</h2>
            <p>{university?.name}の卒業生体験記を準備中です。</p>
          </div>
        ) : (
          <div className="alumniSearchLayout">
            <AlumniSearchPanel
              draftQuery={draftQuery}
              filters={filters}
              facets={facets}
              onDraftQueryChange={setDraftQuery}
              onSearch={applyQuery}
              onSelectFaculty={(faculty) => updateFilter({ faculty })}
              onSelectDestination={(destination) => updateFilter({ destination })}
              onSelectJobRole={(jobRole) => updateFilter({ jobRole })}
              onSelectTag={(tag) => updateFilter({ tag })}
              onClear={() => {
                setDraftQuery("");
                setFilters((current) => ({ ...emptyFilters(), sort: current.sort }));
                setPage(1);
              }}
            />

            <div className="alumniSearchResults">
              <div className="alumniResultBar">
                <p>
                  {paged.total === 0
                    ? "0件"
                    : `No. ${paged.start}〜${paged.end}件 / ${paged.total}件中`}
                </p>
                {filtering && <span>絞り込み検索中</span>}
                <div className="alumniSortTabs" role="tablist" aria-label="並び替え">
                  {sortOptions.map((option) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={filters.sort === option.key}
                      className={filters.sort === option.key ? "isActive" : ""}
                      key={option.key}
                      onClick={() => updateFilter({ sort: option.key })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {paged.items.length === 0 ? (
                <div className="careerState">
                  <h2>条件に合う体験記がありません</h2>
                  <p>キーワードやカテゴリーを変えて、もう一度探してみてください。</p>
                </div>
              ) : (
                <div className="alumniGrid">
                  {paged.items.map((story) => (
                    <AlumniStoryCard story={story} key={story.id} />
                  ))}
                </div>
              )}

              {paged.pageCount > 1 && (
                <div className="alumniPagination">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                    前へ
                  </button>
                  <span>
                    {page} / {paged.pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={page >= paged.pageCount}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    次へ
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
