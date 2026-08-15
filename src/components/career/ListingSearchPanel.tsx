import { Search } from "lucide-react";

export type ListingCategoryGroup = {
  title: string;
  items: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
};

type ListingSearchPanelProps = {
  draftQuery: string;
  searchLabel: string;
  hasFilter: boolean;
  groups: ListingCategoryGroup[];
  onDraftQueryChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

export default function ListingSearchPanel({
  draftQuery,
  searchLabel,
  hasFilter,
  groups,
  onDraftQueryChange,
  onSearch,
  onClear,
}: ListingSearchPanelProps) {
  return (
    <aside className="listingSearchPanel">
      <form
        className="listingKeywordSearch"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <h2>フリーワードから探す</h2>
        <div className="listingKeywordRow">
          <input
            type="search"
            value={draftQuery}
            onChange={(event) => onDraftQueryChange(event.target.value)}
            placeholder="キーワードで検索"
            aria-label={searchLabel}
          />
          <button type="submit" className="careerPrimaryButton" aria-label="検索">
            <Search aria-hidden="true" />
            検索
          </button>
        </div>
      </form>

      <div className="listingCategorySearch">
        <div className="listingCategoryHead">
          <h2>カテゴリーから探す</h2>
          {hasFilter && (
            <button type="button" onClick={onClear}>
              条件をクリア
            </button>
          )}
        </div>
        {groups.map((group) => (
          <CategoryGroup key={group.title} {...group} />
        ))}
      </div>
    </aside>
  );
}

function CategoryGroup({ title, items, selected, onSelect }: ListingCategoryGroup) {
  if (items.length === 0) return null;
  return (
    <div className="listingCategoryGroup">
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
