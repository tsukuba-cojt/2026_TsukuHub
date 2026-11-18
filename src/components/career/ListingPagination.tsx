type ListingPaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export default function ListingPagination({
  page,
  pageCount,
  onPageChange,
}: ListingPaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <div className="listingPagination">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        前へ
      </button>
      <span>
        {page} / {pageCount}
      </span>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        次へ
      </button>
    </div>
  );
}
