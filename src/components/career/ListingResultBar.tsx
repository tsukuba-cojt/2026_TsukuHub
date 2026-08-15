type SortOption<K extends string> = {
  key: K;
  label: string;
};

type ListingResultBarProps<K extends string> = {
  start: number;
  end: number;
  total: number;
  filtering: boolean;
  sort: K;
  sortOptions: SortOption<K>[];
  onSort: (key: K) => void;
};

export default function ListingResultBar<K extends string>({
  start,
  end,
  total,
  filtering,
  sort,
  sortOptions,
  onSort,
}: ListingResultBarProps<K>) {
  return (
    <div className="listingResultBar">
      <p>{total === 0 ? "0件" : `No. ${start}〜${end}件 / ${total}件中`}</p>
      {filtering && <span>絞り込み検索中</span>}
      <div className="listingSortTabs" role="tablist" aria-label="並び替え">
        {sortOptions.map((option) => (
          <button
            type="button"
            role="tab"
            aria-selected={sort === option.key}
            className={sort === option.key ? "isActive" : ""}
            key={option.key}
            onClick={() => onSort(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
