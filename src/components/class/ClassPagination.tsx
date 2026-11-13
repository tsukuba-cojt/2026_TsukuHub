import "../../styles/class/ClassPagination.css";

type Props = {
  currentPage: number;
  totalPages: number;
  onChangePage: (page: number) => void;
};

function getPageList(currentPage: number, totalPages: number) {
  const pages: Array<number | "..."> = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      pages.push(page);
    }
    return pages;
  }

  pages.push(1);

  if (currentPage > 4) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 3) {
    pages.push("...");
  }

  pages.push(totalPages);
  return pages;
}

function ClassPagination({ currentPage, totalPages, onChangePage }: Props) {
  const pages = getPageList(currentPage, totalPages);

  return (
    <nav className="classPagination" aria-label="講義一覧のページ">
      <button
        type="button"
        aria-label="前のページ"
        disabled={currentPage <= 1}
        onClick={() => onChangePage(Math.max(1, currentPage - 1))}
      >
        ‹
      </button>
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`}>...</span>
        ) : (
          <button
            type="button"
            key={page}
            className={page === currentPage ? "isActive" : ""}
            onClick={() => onChangePage(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        aria-label="次のページ"
        disabled={currentPage >= totalPages}
        onClick={() => onChangePage(Math.min(totalPages, currentPage + 1))}
      >
        ›
      </button>
    </nav>
  );
}

export default ClassPagination;
