import { Search } from "lucide-react";
import type { AlumniSearchQuery } from "../../lib/alumniSearch";

type Facets = {
  faculties: string[];
  destinations: string[];
  jobRoles: string[];
  tags: string[];
};

type AlumniSearchPanelProps = {
  draftQuery: string;
  filters: AlumniSearchQuery;
  facets: Facets;
  onDraftQueryChange: (value: string) => void;
  onSearch: () => void;
  onSelectFaculty: (value: string | null) => void;
  onSelectDestination: (value: string | null) => void;
  onSelectJobRole: (value: string | null) => void;
  onSelectTag: (value: string | null) => void;
  onClear: () => void;
};

export default function AlumniSearchPanel({
  draftQuery,
  filters,
  facets,
  onDraftQueryChange,
  onSearch,
  onSelectFaculty,
  onSelectDestination,
  onSelectJobRole,
  onSelectTag,
  onClear,
}: AlumniSearchPanelProps) {
  const hasFilter =
    Boolean(filters.query.trim()) ||
    Boolean(filters.faculty) ||
    Boolean(filters.destination) ||
    Boolean(filters.jobRole) ||
    Boolean(filters.tag);

  return (
    <aside className="alumniSearchPanel">
      <form
        className="alumniKeywordSearch"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <h2>フリーワードから探す</h2>
        <div className="alumniKeywordRow">
          <input
            type="search"
            value={draftQuery}
            onChange={(event) => onDraftQueryChange(event.target.value)}
            placeholder="キーワードで検索"
            aria-label="体験記のキーワード検索"
          />
          <button type="submit" className="careerPrimaryButton" aria-label="検索">
            <Search aria-hidden="true" />
            検索
          </button>
        </div>
      </form>

      <div className="alumniCategorySearch">
        <div className="alumniCategoryHead">
          <h2>カテゴリーから探す</h2>
          {hasFilter && (
            <button type="button" onClick={onClear}>
              条件をクリア
            </button>
          )}
        </div>

        <CategoryGroup
          title="職種"
          items={facets.jobRoles}
          selected={filters.jobRole}
          onSelect={onSelectJobRole}
        />
        <CategoryGroup
          title="進路・業界"
          items={facets.destinations}
          selected={filters.destination}
          onSelect={onSelectDestination}
        />
        <CategoryGroup
          title="学群・学類"
          items={facets.faculties}
          selected={filters.faculty}
          onSelect={onSelectFaculty}
        />
        <CategoryGroup
          title="タグ"
          items={facets.tags}
          selected={filters.tag}
          onSelect={onSelectTag}
        />
      </div>
    </aside>
  );
}

function CategoryGroup({
  title,
  items,
  selected,
  onSelect,
}: {
  title: string;
  items: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="alumniCategoryGroup">
      <p>{title}</p>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              className={selected === item ? "isActive" : ""}
              onClick={() => onSelect(selected === item ? null : item)}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
