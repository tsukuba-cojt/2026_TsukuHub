import "../../styles/class/ClassPagination.css";

const pages = ["1", "2", "3", "...", "12"];

function ClassPagination() {
  return (
    <nav className="classPagination" aria-label="講義一覧のページ">
      <button type="button" aria-label="前のページ">
        ‹
      </button>
      {pages.map((page) =>
        page === "..." ? (
          <span key={page}>...</span>
        ) : (
          <button className={page === "1" ? "isActive" : ""} type="button" key={page}>
            {page}
          </button>
        )
      )}
      <button type="button" aria-label="次のページ">
        ›
      </button>
    </nav>
  );
}

export default ClassPagination;
