import { Link } from "react-router-dom";
import "../../styles/class/ClassPagination.css";

type Props = {
  currentPage: number;
  totalPages: number;
} & ({ pageUrl: (page: number) => string; onChangePage?: never }
  | { pageUrl?: never; onChangePage: (page: number) => void });

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

function ClassPagination({ currentPage, totalPages, onChangePage, pageUrl }: Props) {
  function control(page: number, text: string, label?: string, disabled = false) {
    const current = !label && page === currentPage;
    const attrs = {
      className: current ? "isActive" : undefined,
      "aria-label": label,
      "aria-current": current ? "page" as const : undefined,
    };
    if (pageUrl && !disabled) return <Link key={label ?? page} to={pageUrl(page)} {...attrs}>{text}</Link>;
    return <button type="button" key={label ?? page} disabled={disabled} {...attrs}
      onClick={() => onChangePage?.(page)}>{text}</button>;
  }

  return (
    <nav className="classPagination" aria-label="講義一覧のページ">
      {control(currentPage - 1, "‹", "前のページ", currentPage <= 1)}
      {getPageList(currentPage, totalPages).map((page, index) =>
        page === "..." ? <span key={`ellipsis-${index}`}>...</span> : control(page, String(page))
      )}
      {control(currentPage + 1, "›", "次のページ", currentPage >= totalPages)}
    </nav>
  );
}

export default ClassPagination;
